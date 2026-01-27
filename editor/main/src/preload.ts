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
        exist: (path: string) => ipcRenderer.invoke("file:exist", path),
        // can delele both folder and file
        delete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:delete", path, recycle),
        create: (fullPath: string, data: string) => ipcRenderer.invoke("file:create", fullPath, data),
        open: () => ipcRenderer.invoke("file:open"),
        import: (importPath: string, destFolder: string) => ipcRenderer.invoke("file:import", importPath, destFolder),
        getText: (destPath: string) => ipcRenderer.invoke("file:getText", destPath),
        openSave: (fileName: string, data: string) => ipcRenderer.invoke("file:openSave", fileName, data),
        save: (destPath: string, data: string) => ipcRenderer.invoke("file:save", destPath, data),
        getSha256: (path: string) => ipcRenderer.invoke("file:getSha256", path),
    },
    ktx2: {
        createTextureKTX2: (sourcePath: string, destPath: string, metaHash: string, settings: KTX2.TextureKTX2Settings) => 
            ipcRenderer.invoke("ktx2:createTextureKTX2", sourcePath, destPath, metaHash, settings),
        getMetaHash: (path: string) => ipcRenderer.invoke("ktx2:getMetaHash", path)
    }
});
contextBridge.exposeInMainWorld("fsPath", {
    extname: (p: string) => ipcRenderer.invoke("fsPath:extname", p),
    basename: (p: string, suffix?: string) => ipcRenderer.invoke("fsPath:basename", p, suffix),
    dirname: (p: string) => ipcRenderer.invoke("fsPath:dirname", p),
    join: (...paths: string[]) => ipcRenderer.invoke("fsPath:join", paths),
});
