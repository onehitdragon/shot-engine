import { createAssetFolder, type Assets } from "../../../../engine-zod";

export function fileIsImage(file: DirectoryTree.File){
    return pathIsImage(file.path);
}
export function pathIsImage(path: string){
    const pathLC = path.toLocaleLowerCase();
    return (pathLC.endsWith(".jpg") || pathLC.endsWith(".png"));
}
export async function createDefaultFolder(path: string){
    await window.api.folder.create(path);
    const metaPath = path + ".meta.json";
    const metaExist = await window.api.file.exist(metaPath);
    if(metaExist) return;
    const asset = createAssetFolder();
    await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
}
export async function createFolderWithMeta(path: string){
    const folderCreated = await window.api.folder.create(path);

    const metaPath = path + ".meta.json";
    const asset = createAssetFolder();
    await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
    const metaCreated: DirectoryTree.File = {
        type: "File",
        path: metaPath,
        name: await window.fsPath.basename(metaPath)
    };

    const metaObject: Assets.MetaObject = { path, asset };

    return [folderCreated, metaCreated, metaObject] as const;
}
export function loop(
    path: string,
    entryRecord: Record<string, DirectoryTree.Entry>,
    result: (entry: DirectoryTree.Entry, metaEntry: DirectoryTree.Entry) => void
){
    const entry = entryRecord[path];
    if(!entry) return;
    const metaEntry = entryRecord[entry.path + ".meta.json"];
    if(!metaEntry) return;
    result(entry, metaEntry);
    if(entry.type !== "Directory") return;
    for(const child of entry.children){
        if(child.endsWith(".meta.json")) continue;
        loop(child, entryRecord, result);
    }
}
