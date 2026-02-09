import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    close: () => ipcRenderer.send("window:close"),
    maximize: () => ipcRenderer.send("window:maximize"),
    minimize: () => ipcRenderer.send("window:minimize"),
    showError: (reason: string) => ipcRenderer.invoke("window:showError", reason),
    win: {
        isFocused: () => ipcRenderer.invoke("win:isFocus"),
        onFocus: (callback: any) => {
            const subscription = () => {
                callback();
            };
            ipcRenderer.on("win:onFocus", subscription);
            return () => {
                ipcRenderer.off("win:onFocus", subscription);
            }
        },
        onBlur: (callback: any) => {
            const subscription = () => {
                callback();
            };
            ipcRenderer.on("win:onBlur", subscription);
            return () => {
                ipcRenderer.off("win:onBlur", subscription);
            }
        },
    },
    folder: {
        open: () => ipcRenderer.invoke("folder:open"),
        ensureMetaFile: (projectPath: string) => ipcRenderer.invoke("folder:ensureMetaFile", projectPath),
        load: (path: string) => ipcRenderer.invoke("folder:load", path),
        create: (path: string) => ipcRenderer.invoke("folder:create", path),
        watch: (path: string) => ipcRenderer.invoke("folder:watch", path),
        unwatch: (path: string) => ipcRenderer.invoke("folder:unwatch", path),
        onWatchEvent: (callback: any) => {
            const subscription = () => {
                callback();
            };
            ipcRenderer.on("folder:onWatchEvent", subscription);
            return () => {
                ipcRenderer.off("folder:onWatchEvent", subscription);
            }
        },
    },
    file: {
        exist: (path: string) => ipcRenderer.invoke("file:exist", path),
        // can delele both folder and file
        delete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:delete", path, recycle),
        silentDelete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:silentDelete", path, recycle),
        create: (fullPath: string, data: string) => ipcRenderer.invoke("file:create", fullPath, data),
        open: () => ipcRenderer.invoke("file:open"),
        copy: (src: string, dest: string) => ipcRenderer.invoke("file:copy", src, dest),
        importModel: (importPath: string, destFolder: string) => ipcRenderer.invoke("file:importModel", importPath, destFolder),
        getText: (destPath: string) => ipcRenderer.invoke("file:getText", destPath),
        openSave: (fileName: string, data: string) => ipcRenderer.invoke("file:openSave", fileName, data),
        save: (destPath: string, data: string) => ipcRenderer.invoke("file:save", destPath, data),
        getSha256: (path: string) => ipcRenderer.invoke("file:getSha256", path),
        loadDataURL: (path: string) => ipcRenderer.invoke("file:loadDataURL", path),
        readImage: (path: string) => ipcRenderer.invoke("file:readImage", path),
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
