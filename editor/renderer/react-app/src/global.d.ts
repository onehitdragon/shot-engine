export type ApiType = {
    close: () => void,
    maximize: () => void,
    minimize: () => void,
}

declare global{
    interface Window{
        api: ApiType
    }
}
