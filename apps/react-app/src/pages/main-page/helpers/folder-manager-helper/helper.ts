import { createAssetFolder, type Assets } from "../../../../engine-zod";

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
    result: (entry: DirectoryTree.Entry) => void
){
    const entry = entryRecord[path];
    if(!entry) return;
    result(entry);
    if(entry.type !== "Directory") return;
    for(const child of entry.children){
        loop(child, entryRecord, result);
    }
}
