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
        delete: (path: string, recycle: boolean) => Promise<boolean>,
        create: (parentPath: string, name: string) => Promise<DirectoryTree.File | null>,
    }
}

declare global{
    interface Window{
        api: ApiType
    }
}
