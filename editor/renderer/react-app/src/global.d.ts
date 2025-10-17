export type ApiType = {
    close: () => void,
    maximize: () => void,
    minimize: () => void,
    folder: {
        open: () => Promise<string | null>,
        load: (path: string) => Promise<DirectoryTree.Directory>
    }
}

declare global{
    interface Window{
        api: ApiType
    }
}
