import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    close: () => ipcRenderer.send("window:close"),
    maximize: () => ipcRenderer.send("window:maximize"),
    minimize: () => ipcRenderer.send("window:minimize"),
    folder: {
        open: () => ipcRenderer.invoke("folder:open"),
        load: (path: string) => ipcRenderer.invoke("folder:load", path),
        create: (parentPath: string, name: string) => ipcRenderer.invoke("folder:create", parentPath, name)
    },
    file: {
        // can delele both folder and file
        delete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:delete", path, recycle),
        create: (parentPath: string, name: string) => ipcRenderer.invoke("file:create", parentPath, name),
        open: () => ipcRenderer.invoke("file:open"),
        import: (importPath: string, destFolder: string) => ipcRenderer.invoke("file:import", importPath, destFolder),
        getText: (destPath: string) => ipcRenderer.invoke("file:getText", destPath),
    }
});
