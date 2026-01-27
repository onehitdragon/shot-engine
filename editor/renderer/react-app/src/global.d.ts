export type ApiType = {
    close: () => void,
    maximize: () => void,
    minimize: () => void,
    folder: {
        open: () => Promise<string | null>,
        load: (path: string) => Promise<DirectoryTree.Directory>,
        create: (parentPath: string, name: string) => Promise<DirectoryTree.Directory | null>,
    },
    file: {
        exist: (path: string) => Promise<boolean>,
        delete: (path: string, recycle: boolean) => Promise<boolean>,
        create: (fullPath: string, data: string) => Promise<DirectoryTree.File>,
        open: () => Promise<string | null>,
        import: (importPath: string, destFolder: string) => Promise<DirectoryTree.File | null>,
        getText: (destPath: string) => Promise<string>,
        openSave: (fileName: string, data: string) => Promise<string | null>,
        save: (destPath: string, data: string) => Promise<void>,
        getSha256: (path: string) => Promise<string>,
    },
    ktx2: {
        createTextureKTX2: (sourcePath: string, destPath: string, metaHash: string, settings: KTX2.TextureKTX2Settings) => Promise<DirectoryTree.File>,
        getMetaHash: (path: string) => Promise<string>
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
