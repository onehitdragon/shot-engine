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
        load: (path: string) => ipcRenderer.invoke("folder:load", path),
        create: (path: string) => ipcRenderer.invoke("folder:create", path),
    },
    file: {
        exist: (path: string) => ipcRenderer.invoke("file:exist", path),
        // can delele both folder and file
        delete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:delete", path, recycle),
        silentDelete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:silentDelete", path, recycle),
        create: (fullPath: string, data: string) => ipcRenderer.invoke("file:create", fullPath, data),
        open: () => ipcRenderer.invoke("file:open"),
        copy: (src: string, dest: string) => ipcRenderer.invoke("file:copy", src, dest),
        assimpImporter: (importPath: string) => ipcRenderer.invoke("file:assimpImporter", importPath),
        getText: (destPath: string) => ipcRenderer.invoke("file:getText", destPath),
        openSave: (fileName: string, data: string) => ipcRenderer.invoke("file:openSave", fileName, data),
        save: (destPath: string, data: string) => ipcRenderer.invoke("file:save", destPath, data),
        getSha256: (path: string) => ipcRenderer.invoke("file:getSha256", path),
        loadDataURL: (path: string) => ipcRenderer.invoke("file:loadDataURL", path)
    },
    resource: {
        saveMesh: (path: string, mesh: Resource.Mesh) => ipcRenderer.invoke("resource:saveMesh", path, mesh),
        loadMesh: (path: string) => ipcRenderer.invoke("resource:loadMesh", path),
        saveImage: (destPath: string, imagePath: string) => 
            ipcRenderer.invoke("resource:saveImage", destPath, imagePath),
        loadImage: (destPath: string) => 
            ipcRenderer.invoke("resource:loadImage", destPath)
    }
});
contextBridge.exposeInMainWorld("fsPath", {
    extname: (p: string) => ipcRenderer.invoke("fsPath:extname", p),
    basename: (p: string, suffix?: string) => ipcRenderer.invoke("fsPath:basename", p, suffix),
    dirname: (p: string) => ipcRenderer.invoke("fsPath:dirname", p),
    join: (...paths: string[]) => ipcRenderer.invoke("fsPath:join", paths),
});
