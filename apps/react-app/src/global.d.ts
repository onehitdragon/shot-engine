import type { AssetManager, AssetType, Asset, PrefabAsset } from "@shot-engine/types";

export type ApiType = {
    close: () => void,
    maximize: () => void,
    minimize: () => void,
    showError: (reason: string) => Promise<void>,
    win: {
        isFocused: () => Promise<boolean>,
        onFocus: (callback: () => void) => Function,
        onBlur: (callback: () => void) => Function,
    },
    folder: {
        open: () => Promise<string | null>,
        load: (path: string) => Promise<DirectoryTree.Entry[]>,
        create: (path: string) => Promise<DirectoryTree.Directory>,
    },
    file: {
        exist: (path: string) => Promise<boolean>,
        delete: (path: string, recycle: boolean) => Promise<void>,
        silentDelete: (path: string, recycle: boolean) => Promise<void>,
        create: (fullPath: string, data: string) => Promise<DirectoryTree.File>,
        open: () => Promise<string | null>,
        copy: (src: string, dest: string) => Promise<void>,
        assimpImporter: (importPath: string) => Promise<Extract<Importer.JsonImportFile, { type: "assimp" }>>,
        getText: (destPath: string) => Promise<string>,
        openSave: (fileName: string, data: string) => Promise<string | null>,
        save: (destPath: string, data: string) => Promise<void>,
        getSha256: (path: string) => Promise<string>,
        loadDataURL: (path: string) => Promise<string>
    },
    assetManager: {
        config: (config: AssetManager.Config) => Promise<void>,
        rescan: () => Promise<void>,
        close: () => Promise<void>,
        getAssetInfos: (filePath: string) => Promise<AssetManager.AssetInfo[]>,
        getAssetFromUuid: (uuid: string, type: AssetType) => Promise<Asset>,
        updateAssetPropertyByUuid: (uuid: string, property: string) => Promise<void>,
        getAssetInfoFromUuid: (uuid: string) => Promise<AssetManager.AssetInfo | undefined>
        getAssetInfosFromType: (type: AssetType) => Promise<AssetManager.AssetInfo[]>
        savePrefabAssetBinary: (prefabAsset: PrefabAsset, filePath: string) => Promise<void>
        getFilePathFromAssetId: (uuid: string) => Promise<string | undefined>
    },
    resource: {
        saveMesh: (path: string, mesh: Resource.Mesh) => Promise<void>,
        loadMesh: (path: string) => Promise<Resource.MeshBin>,
        saveImage: (destPath: string, imagePath: string) => Promise<void>,
        loadImage: (destPath: string) => Promise<Resource.ImageBin>,
    }
}
export type fsPathType = {
    extname: (p: string) => Promise<string>,
    basename: (p: string, suffix?: string) => Promise<string>,
    dirname: (p: string) => Promise<string>,
    join: (...paths: string[]) => Promise<string>,
}

declare global{
    interface Window{
        api: ApiType,
        fsPath: fsPathType
    }
}
