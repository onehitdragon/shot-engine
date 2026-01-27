import { ImageSchema, type Imports } from "../../../../engine-zod";
import { addLog } from "../../../../global-state/slices/app-loading-slice";
import { addEntryToDirectory, removeEntryFromDirectory } from "../../../../global-state/slices/folder-manager-slice";
import type { AppDispatch } from "../../../../global-state/store";
import { createDefaultTexture, extIsImage } from "../image-import/image-import-helpers";

async function fileLooper(
    directory: DirectoryTree.Directory,
    onFile: (file: DirectoryTree.File, directory: DirectoryTree.Directory) => Promise<void> | void
){
    for(const entry of directory.children){
        if(entry.type === "File") await onFile(entry, directory);
        else await fileLooper(entry, onFile);
    }
}
function getChildDirectory(
    directory: DirectoryTree.Directory,
    ...childNames: string[]
){
    for (const name of childNames) {
        const next = directory.children.find(
            (e): e is DirectoryTree.Directory => e.type === "Directory" && e.name === name
        );
        if (!next) return null;
        directory = next;
    }
    return directory;
}
export async function syncImageMetaFiles(
    directory: DirectoryTree.Directory,
    dispatch: AppDispatch
){
    const images: Imports.Image[] = [];
    const imagesMetaFileMap = new Map<Imports.Image, { metaPath: string, sourcePath: string }>();
    // create .meta.json if missing or rewrite if wrong
    await fileLooper(directory, async (file) => {
        const imageMetaState = await ensureImageMetaFile(file, dispatch);
        if(imageMetaState){
            const { image, metaPath, sourcePath } = imageMetaState;
            imagesMetaFileMap.set(image, { metaPath, sourcePath});
            images.push(image);
        }
    });
    // remove unnecessary .meta.json
    await fileLooper(directory, async (file) => {
        await deleteUnnecessaryMetaFile(file, dispatch);
    });
    // sync editor directory
    const editorImageDirectory = await ensureEditorImageDirectory(directory);
    await syncEditorImageDirectory(editorImageDirectory, imagesMetaFileMap, dispatch);
    return images;
}
async function ensureImageMetaFile(
    file: DirectoryTree.File,
    dispatch: AppDispatch
){
    const path = file.path;
    const dirPath = await window.fsPath.dirname(path);
    const ext = (await window.fsPath.extname(path)).toLocaleLowerCase();
    if(extIsImage(ext)){
        let newImage: Imports.Image | null = null;
        const metaFilePath = await window.fsPath.join(dirPath, `${file.name}.meta.json`);
        const metaFileExist = await window.api.file.exist(metaFilePath);
        if(!metaFileExist){
            newImage = createDefaultTexture();
            const created = await window.api.file.create(
                metaFilePath,
                JSON.stringify(newImage, null, 2)
            );
            dispatch(addEntryToDirectory({ directoryPath: dirPath, entry: created }));
            dispatch(addLog({ log: `Created ${metaFilePath}` }));
        }
        else{
            const contentJson = await window.api.file.getText(metaFilePath);
            const contentObject = JSON.parse(contentJson);
            const zodResult = await ImageSchema.safeParseAsync(contentObject);
            if(!zodResult.success){
                newImage = createDefaultTexture();
                await window.api.file.save(
                    metaFilePath,
                    JSON.stringify(newImage, null, 2)
                );
                dispatch(addLog({ log: `Re-new ${metaFilePath}` }));
            }
        }
        if(newImage){
            return { image: newImage, metaPath: metaFilePath, sourcePath: path }
        }
        else{
            const contentJson = await window.api.file.getText(metaFilePath);
            const oldImage: Imports.Image = JSON.parse(contentJson);
            return { image: oldImage, metaPath: metaFilePath, sourcePath: path }
        }
    }
}
async function deleteUnnecessaryMetaFile(
    file: DirectoryTree.File,
    dispatch: AppDispatch
){
    const path = file.path;
    if(path.endsWith(".meta.json")){
        const dirPath = await window.fsPath.dirname(path);
        const sourceName = await window.fsPath.basename(path, ".meta.json");
        const sourceFilePath = await window.fsPath.join(dirPath, sourceName);
        const sourceFileExist = await window.api.file.exist(sourceFilePath);
        if(!sourceFileExist){
            await window.api.file.delete(path, true);
            dispatch(removeEntryFromDirectory({ directoryPath: dirPath, entryPath: path }));
            dispatch(addLog({ log: `Deleted ${path}` }));
        }
    }
}
async function ensureEditorImageDirectory(rootDirectory: DirectoryTree.Directory){
    const editorImageDirectory = getChildDirectory(rootDirectory, "Editor", "Images");
    if(editorImageDirectory) return editorImageDirectory;
    else {
        const editorImageDirectoryPath = await window.fsPath.join(rootDirectory.path, "Editor");
        const created = await window.api.folder.create(editorImageDirectoryPath, "Images");
        if(created) return created;
        else throw "error when create Editor Image Directory"
    }
}
async function syncEditorImageDirectory(
    editorImageDirectory: DirectoryTree.Directory,
    imageMetaFileMap: Map<Imports.Image, { metaPath: string, sourcePath: string }>,
    dispatch: AppDispatch
){
    for(const imageMetaFileKV of imageMetaFileMap){
        const [image, paths] = imageMetaFileKV;
        const imageKTX2Path = await window.fsPath.join(editorImageDirectory.path, `${image.id}.ktx2`);
        const imageKTX2Exist = await window.api.file.exist(imageKTX2Path);
        let kxtIsStale = false;
        if(!imageKTX2Exist){
            kxtIsStale = true;
        }
        else{
            const metaHash = await window.api.file.getSha256(paths.metaPath);
            const ktxMetaHash = await window.api.ktx2.getMetaHash(imageKTX2Path);
            if(metaHash !== ktxMetaHash){
                kxtIsStale = true;
            }
        }
        if(kxtIsStale){
            const metaHash = await window.api.file.getSha256(paths.metaPath);
            if(image.imageType === "Texture"){
                dispatch(addLog({ log: `Creating ${imageKTX2Path}` }));
                const created = await window.api.ktx2.createTextureKTX2(paths.sourcePath, imageKTX2Path, metaHash, {
                    sRGB: image.sRGB,
                    mipGen: image.generateMipmaps,
                    qualityLevel: image.qualityLevel
                });
                dispatch(addEntryToDirectory({
                    directoryPath: editorImageDirectory.path,
                    entry: created
                }));
                dispatch(addLog({ log: `Created ${imageKTX2Path}` }));
            }
        }
    }
}
