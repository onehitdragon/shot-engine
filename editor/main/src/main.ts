import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { setTimeout } from "timers/promises";

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
    ipcMain.handle("ping", async () => {
        return await setTimeout(4000, "pongg");
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
