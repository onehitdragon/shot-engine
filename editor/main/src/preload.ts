import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    close: () => ipcRenderer.send("window:close"),
    maximize: () => ipcRenderer.send("window:maximize"),
    minimize: () => ipcRenderer.send("window:minimize"),
    folder: {
        open: () => ipcRenderer.invoke("folder:open"),
        load: (path: string) => ipcRenderer.invoke("folder:load", path)
    },
    file: {
        delete: (path: string, recycle: boolean) => ipcRenderer.invoke("file:delete", path, recycle),
    }
});
