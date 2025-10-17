declare namespace DirectoryTree{
    export type Directory = {
        type: "Directory"
        name: string,
        path: string,
        children: (Directory | File)[]
    }
    export type File = {
        type: "File",
        name: string,
        path: string
    }
}