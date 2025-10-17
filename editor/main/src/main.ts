import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    if(process.env.VITE_DEV_SERVER_URL){
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else{
        throw new Error("Dont find env process.env.VITE_DEV_SERVER_URL");
    }
};

app.whenReady()
.then(() => {
    ipcMain.on("window:close", (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if(win == null) return;
        win.close();
    });
    ipcMain.on("window:maximize", (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if(win == null) return;
        win.isMaximized() ? win.unmaximize() : win.maximize();
    });
    ipcMain.on("window:minimize", (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if(win == null) return;
        win.minimize();
    });
    ipcMain.handle("folder:open", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"]
        });
        if(result.canceled) return null;
        return result.filePaths[0];
    });
    ipcMain.handle("folder:load", async (e, folderPath: string) => {
        async function read(dirPath: string){
            const directory: DirectoryTree.Directory = {
                type: "Directory",
                name: path.basename(dirPath),
                path: dirPath,
                children: []
            };
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for(const entry of entries){
                if(entry.name.startsWith('.')) continue;
                const fullPath = path.join(dirPath, entry.name);
                if(entry.isFile()){
                    directory.children.push({
                        type: "File",
                        name: entry.name,
                        path: fullPath
                    });
                }
                else{
                    directory.children.push(
                        await read(fullPath)
                    );
                }
            }
            return directory;
        }
        return await read(folderPath);
    });

    createWindow();
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length == 0) createWindow();
    });
})
.catch(err => {
    console.error(err);
    app.quit();
});
app.on("window-all-closed", () => {
    if(process.platform !== 'darwin') app.quit();
});
