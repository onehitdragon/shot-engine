import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    close: () => ipcRenderer.send("window:close"),
    maximize: () => ipcRenderer.send("window:maximize"),
    minimize: () => ipcRenderer.send("window:minimize"),
});
