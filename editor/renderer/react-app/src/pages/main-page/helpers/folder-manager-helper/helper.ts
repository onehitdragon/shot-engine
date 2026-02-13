import { createAssetFolder } from "../../../../engine-zod";
import { addAsset } from "../../../../global-state/slices/asset-manager-slice";
import { addEntry } from "../../../../global-state/slices/folder-manager-slice";
import type { AppDispatch } from "../../../../global-state/store";

export function fileIsImage(file: DirectoryTree.File){
    return pathIsImage(file.path);
}
export function pathIsImage(path: string){
    const pathLC = path.toLocaleLowerCase();
    return (pathLC.endsWith(".jpg") || pathLC.endsWith(".png"));
}
export async function createFolder(path: string, dispatch?: AppDispatch){
    await window.api.folder.create(path);
    const asset = createAssetFolder();
    const metaPath = path + ".meta.json";
    const metaExist = await window.api.file.exist(metaPath);
    if(metaExist) return;
    await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));

    if(dispatch){
        const parentPath = await window.fsPath.dirname(path);
        const folder: DirectoryTree.Directory = {
            type: "Directory",
            path: path,
            name: await window.fsPath.basename(path),
            children: []
        };
        dispatch(addEntry({ parentPath, entry: folder }));
        const meta: DirectoryTree.File = {
            type: "File",
            path: metaPath,
            name: await window.fsPath.basename(metaPath)
        };
        dispatch(addEntry({ parentPath, entry: meta }));
        dispatch(addAsset({ metaObject: { path, asset } }));
    }
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
