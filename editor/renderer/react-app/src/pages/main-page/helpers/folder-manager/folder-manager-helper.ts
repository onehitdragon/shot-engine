import { ImageSchema, type Imports } from "../../../../engine-zod";
// import { addLog } from "../../../../global-state/slices/app-loading-slice";
// import { addEntryToDirectory, removeEntryFromDirectory } from "../../../../global-state/slices/folder-manager-slice";
// import type { AppDispatch, RootState } from "../../../../global-state/store";
import { createDefaultTexture, extIsImage } from "../image-import/image-import-helpers";

// async function getImageEditorPath(projectPath: string){
//     return await window.fsPath.join(projectPath, "Editor", "Images");
// }
// function getChildDirectory(
//     directory: DirectoryTree.Directory,
//     ...childNames: string[]
// ){
//     for (const name of childNames) {
//         const next = directory.children.find(
//             (e): e is DirectoryTree.Directory => e.type === "Directory" && e.name === name
//         );
//         if (!next) return null;
//         directory = next;
//     }
//     return directory;
// }
// export async function syncImageMetaFiles(
//     directory: DirectoryTree.Directory,
//     dispatch: AppDispatch
// ){
//     const images: Imports.Image[] = [];
//     const imagesMetaFileMap = new Map<Imports.Image, { metaPath: string, sourcePath: string }>();
//     // create .meta.json if missing or rewrite if wrong
//     await fileLooper(directory, async (file) => {
//         const imageMetaState = await ensureImageMetaFile(file.path, dispatch, (log) => { dispatch(addLog({log})) });
//         if(imageMetaState){
//             const { image, metaPath, sourcePath } = imageMetaState;
//             imagesMetaFileMap.set(image, { metaPath, sourcePath});
//             images.push(image);
//         }
//     });
//     // remove unnecessary .meta.json
//     await fileLooper(directory, async (file) => {
//         await deleteUnnecessaryMetaFile(file, dispatch);
//     });
//     // sync editor directory
//     const editorImageDirectory = await ensureEditorImageDirectory(directory);
//     await ensureKTXFileInEditorImageDirectory(editorImageDirectory, imagesMetaFileMap, dispatch);
//     deleteUnnecessaryFileInEditorImageDirectory(editorImageDirectory, imagesMetaFileMap, dispatch);
//     return images;
// }
export async function ensureMetaFile(
    sourcePath: string,
    projectPath: string,
    onLog?: (log: string) => void
){
    const ext = (await window.fsPath.extname(sourcePath)).toLocaleLowerCase();
    if(extIsImage(ext)){
        let newImage: Imports.Image | null = null;
        const metaFilePath = `${sourcePath}.meta.json`;
        const metaFileExist = await window.api.file.exist(metaFilePath);
        if(!metaFileExist){
            newImage = createDefaultTexture();
            await window.api.file.create(
                metaFilePath,
                JSON.stringify(newImage, null, 2)
            );
            onLog?.(`Created ${metaFilePath}`);
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
                onLog?.(`Re-new ${metaFilePath}`);
            }
        }
        let image: Imports.Image | null = null;
        if(newImage){
            image = newImage;
        }
        else{
            const contentJson = await window.api.file.getText(metaFilePath);
            const oldImage: Imports.Image = JSON.parse(contentJson);
            image = oldImage;
        }
        const imageEditorPath = await window.fsPath.join(projectPath, "Editor", "Images");
        const ktxPath = await window.fsPath.join(imageEditorPath, `${image.id}.ktx2`);
        const ktxExist = await window.api.file.exist(ktxPath);
        let kxtIsStale = false;
        if(!ktxExist) kxtIsStale = true;
        else{
            const metaHash = await window.api.file.getSha256(metaFilePath);
            const ktxMetaHash = await window.api.ktx2.getMetaHash(ktxPath);
            if(metaHash !== ktxMetaHash){
                kxtIsStale = true;
            }
        }
        if(!kxtIsStale) return;
        if(image.imageType === "Texture"){
            onLog?.(`Creating ${ktxPath}`);
            const metaHash = await window.api.file.getSha256(metaFilePath);
            await window.api.ktx2.createTextureKTX2(
                sourcePath, ktxPath, metaHash,
                {
                    sRGB: image.sRGB,
                    mipGen: image.generateMipmaps,
                    qualityLevel: image.qualityLevel
                }
            );
            onLog?.(`Created ${ktxPath}`);
        }
    }
}
// async function deleteUnnecessaryMetaFile(
//     file: DirectoryTree.File,
//     dispatch: AppDispatch
// ){
//     const path = file.path;
//     if(path.endsWith(".meta.json")){
//         const dirPath = await window.fsPath.dirname(path);
//         const sourceName = await window.fsPath.basename(path, ".meta.json");
//         const sourceFilePath = await window.fsPath.join(dirPath, sourceName);
//         const sourceFileExist = await window.api.file.exist(sourceFilePath);
//         if(!sourceFileExist){
//             await window.api.file.silentDelete(path, false);
//             dispatch(removeEntryFromDirectory({ directoryPath: dirPath, entryPath: path }));
//             dispatch(addLog({ log: `Deleted ${path}` }));
//         }
//     }
// }
// async function ensureEditorImageDirectory(rootDirectory: DirectoryTree.Directory){
//     const editorImageDirectory = getChildDirectory(rootDirectory, "Editor", "Images");
//     if(editorImageDirectory) return editorImageDirectory;
//     else {
//         const editorImageDirectoryPath = await window.fsPath.join(rootDirectory.path, "Editor");
//         const created = await window.api.folder.create(editorImageDirectoryPath, "Images");
//         if(created) return created;
//         else throw "error when create Editor Image Directory"
//     }
// }
// async function ensureKTXFileInEditorImageDirectory(
//     editorImageDirectory: DirectoryTree.Directory,
//     imageMetaFileMap: Map<Imports.Image, { metaPath: string, sourcePath: string }>,
//     dispatch: AppDispatch
// ){
//     for(const imageMetaFileKV of imageMetaFileMap){
//         const [image, paths] = imageMetaFileKV;
//         const imageKTX2Path = await window.fsPath.join(editorImageDirectory.path, `${image.id}.ktx2`);
//         const imageKTX2Exist = await window.api.file.exist(imageKTX2Path);
//         let kxtIsStale = false;
//         if(!imageKTX2Exist){
//             kxtIsStale = true;
//         }
//         else{
//             const metaHash = await window.api.file.getSha256(paths.metaPath);
//             const ktxMetaHash = await window.api.ktx2.getMetaHash(imageKTX2Path);
//             if(metaHash !== ktxMetaHash){
//                 kxtIsStale = true;
//             }
//         }
//         if(kxtIsStale){
//             const metaHash = await window.api.file.getSha256(paths.metaPath);
//             if(image.imageType === "Texture"){
//                 dispatch(addLog({ log: `Creating ${imageKTX2Path}` }));
//                 const created = await window.api.ktx2.createTextureKTX2(paths.sourcePath, imageKTX2Path, metaHash, {
//                     sRGB: image.sRGB,
//                     mipGen: image.generateMipmaps,
//                     qualityLevel: image.qualityLevel
//                 });
//                 dispatch(addEntryToDirectory({
//                     directoryPath: editorImageDirectory.path,
//                     entry: created
//                 }));
//                 dispatch(addLog({ log: `Created ${imageKTX2Path}` }));
//             }
//         }
//     }
// }
// async function deleteUnnecessaryFileInEditorImageDirectory(
//     editorImageDirectory: DirectoryTree.Directory,
//     imageMetaFileMap: Map<Imports.Image, { metaPath: string, sourcePath: string }>,
//     dispatch: AppDispatch
// ){
//     const imageMetaFileSet = new Set<string>(
//         Array.from(imageMetaFileMap.keys()).map(image => image.id)
//     );
//     await fileLooper(editorImageDirectory, async (file) => {
//         const path = file.path;
//         const ktxId = await window.fsPath.basename(path, ".ktx2");
//         if(!imageMetaFileSet.has(ktxId)){
//             await window.api.file.silentDelete(path, false);
//             dispatch(removeEntryFromDirectory({ directoryPath: editorImageDirectory.path, entryPath: path }));
//             dispatch(addLog({ log: `Deleted ${path}` }));
//         }
//     });
// }
// export async function ensureMetaFile(
//     sourcePath: string,
//     state: RootState,
//     dispatch: AppDispatch,
//     onLog?: (log: string) => void
// ){
//     const ext = (await window.fsPath.extname(sourcePath)).toLocaleLowerCase();
//     if(extIsImage(ext)){
//         let newImage: Imports.Image | null = null;
//         const metaFilePath = `${sourcePath}.meta.json`;
//         const metaFileExist = await window.api.file.exist(metaFilePath);
//         if(!metaFileExist){
//             newImage = createDefaultTexture();
//             const created = await window.api.file.create(
//                 metaFilePath,
//                 JSON.stringify(newImage, null, 2)
//             );
//             const sourceDir = await window.fsPath.dirname(sourcePath);
//             dispatch(addEntryToDirectory({ directoryPath: sourceDir, entry: created }));
//             onLog?.(`Created ${metaFilePath}`);
//         }
//         else{
//             const contentJson = await window.api.file.getText(metaFilePath);
//             const contentObject = JSON.parse(contentJson);
//             const zodResult = await ImageSchema.safeParseAsync(contentObject);
//             if(!zodResult.success){
//                 newImage = createDefaultTexture();
//                 await window.api.file.save(
//                     metaFilePath,
//                     JSON.stringify(newImage, null, 2)
//                 );
//                 onLog?.(`Re-write ${metaFilePath}`);
//             }
//         }
//         let image: Imports.Image;
//         if(newImage) image = newImage;
//         else{
//             const contentJson = await window.api.file.getText(metaFilePath);
//             const oldImage: Imports.Image = JSON.parse(contentJson);
//             image = oldImage;
//         }
//         const projectPath = state.folderManager.directory?.path;
//         if(!projectPath) return;
//         const imageEditorPath = await getImageEditorPath(projectPath);
//         const ktxPath = await window.fsPath.join(imageEditorPath, `${image.id}.ktx2`);
//         const ktxExist = await window.api.file.exist(ktxPath);
//         let kxtIsStale = false;
//         if(!ktxExist) kxtIsStale = true;
//         else{
//             const metaHash = await window.api.file.getSha256(metaFilePath);
//             const ktxMetaHash = await window.api.ktx2.getMetaHash(ktxPath);
//             if(metaHash !== ktxMetaHash){
//                 kxtIsStale = true;
//             }
//         }
//         if(!kxtIsStale) return;
//         if(image.imageType === "Texture"){
//             onLog?.(`Creating ${ktxPath}`);
//             const metaHash = await window.api.file.getSha256(metaFilePath);
//             const created = await window.api.ktx2.createTextureKTX2(
//                 sourcePath, ktxPath, metaHash,
//                 {
//                     sRGB: image.sRGB,
//                     mipGen: image.generateMipmaps,
//                     qualityLevel: image.qualityLevel
//                 }
//             );
//             dispatch(addEntryToDirectory({
//                 directoryPath: imageEditorPath,
//                 entry: created
//             }));
//             onLog?.(`Created ${ktxPath}`);
//         }
//     }
// }
// export async function deleteMetaFile(
//     sourcePath: string,
//     state: RootState,
//     dispatch: AppDispatch
// ){
//     const ext = await window.fsPath.extname(sourcePath);
//     if(extIsImage(ext)){
//         const metafileName = await window.fsPath.basename(sourcePath) + ".meta.json";
//         const dirPath = await window.fsPath.dirname(sourcePath);
//         const metaFilePath = await window.fsPath.join(dirPath, metafileName);
//         const metaFileExist = await window.api.file.exist(metaFilePath);
//         if(!metaFileExist) return;
//         const json = await window.api.file.getText(metaFilePath);
//         const metaId = JSON.parse(json)["id"] as string | undefined;
//         const projectPath = state.folderManager.directory?.path;
//         if(metaId && projectPath){
//             const imageEditorPath = await getImageEditorPath(projectPath);
//             const ktxPath = await window.fsPath.join(imageEditorPath, `${metaId}.ktx2`);
//             await window.api.file.silentDelete(ktxPath, false);
//             dispatch(removeEntryFromDirectory({ directoryPath: imageEditorPath, entryPath: ktxPath })); 
//         }
//         await window.api.file.silentDelete(metaFilePath, false);
//         dispatch(removeEntryFromDirectory({ directoryPath: dirPath, entryPath: metaFilePath }));
//     }
// }
