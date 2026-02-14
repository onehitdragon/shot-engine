import { app, BrowserWindow, dialog, ipcMain, session } from "electron";
import path from "path";
import fs from "fs-extra";
import { showErrorDialog } from "./message-boxes";
import trash from "trash";
import { assimpImporter } from "./importer/assimp/assimp-importer";
import crypto from "crypto";
import * as fsWalk from '@nodelib/fs.walk';
import { Entry } from "@nodelib/fs.walk";
import { saveMeshToBuffer, readMeshBinary, saveImageToBuffer, readImageBinary } from "./importer/binary/resourceBinary";

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
    let isFocus = false;
    win.on("focus", () => {
        if(!isFocus){
            isFocus = true;
            win.webContents.send("win:onFocus");
        }
    });
    win.on("blur", () => {
        if(isFocus){
            isFocus = false;
            win.webContents.send("win:onBlur");
        }
    });
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
    ipcMain.handle("window:showError", async (e, reason: string) => {
        await showErrorDialog(reason);
    });
    ipcMain.handle("win:isFocus", async (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if(!win) return;
        return win.isFocused();
    });
    ipcMain.handle("fsPath:extname", (e, p: string) => {
        return path.extname(p);
    });
    ipcMain.handle("fsPath:basename", (e, p: string, suffix?: string) => {
        return path.basename(p, suffix);
    });
    ipcMain.handle("fsPath:dirname", (e, p: string) => {
        return path.dirname(p);
    });
    ipcMain.handle("fsPath:join", (e, paths: string[]) => {
        return path.join(...paths);
    });
    ipcMain.handle("folder:open", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"]
        });
        if(result.canceled) return null;
        return result.filePaths[0];
    });
    ipcMain.handle("folder:create", async (e, folderPath: string) => {
        await fs.ensureDir(folderPath);
        const created: DirectoryTree.Directory = {
            type: "Directory",
            name: path.basename(folderPath),
            path: folderPath,
            children: []
        }
        return created;
    });
    ipcMain.handle("folder:load", async (e, folderPath: string) => {
        const entries = await new Promise<Entry[]>((rel, rej) => {
            fsWalk.walk(
                folderPath,
                (err, entries) => {
                    if(err) rej(err);
                    rel(entries);
                }
            );
        });
        const baseDirectory: DirectoryTree.Directory = {
            type: "Directory",
            name: path.basename(folderPath),
            path: folderPath,
            children: []
        };
        const entryMap = new Map<string, DirectoryTree.Entry>();
        entryMap.set(baseDirectory.path, baseDirectory);
        for(const entry of entries){
            const parent = entryMap.get(entry.dirent.parentPath);
            if(!parent || parent.type === "File") throw "internal error";
            let child: DirectoryTree.Entry;
            if(entry.dirent.isDirectory()){
                child = {
                    type: "Directory",
                    name: entry.name,
                    path: entry.path,
                    children: []
                };
            }
            else{
                child = {
                    type: "File",
                    name: entry.name,
                    path: entry.path
                };
            }
            parent.children.push(child.path);
            entryMap.set(entry.path, child);
        }
        return Array.from(entryMap.values());
    });
    ipcMain.handle("file:exist", async (e, path: string) => {
        try{
            await fs.access(path, fs.constants.F_OK);
            return true;
        }
        catch{
            return false;
        }
    });
    ipcMain.handle("file:delete", async (e, path: string, recycle: boolean) => {
        if(recycle){
            await trash([path]);
        }
        else{
            await fs.rm(path, { recursive: true, force: true });
        }
    });
    ipcMain.handle("file:silentDelete", async (e, path: string, recycle: boolean) => {
        if(recycle){
            await trash([path]);
        }
        else{
            await fs.rm(path, { recursive: true, force: true });
        }
    });
    ipcMain.handle("file:create", async (e, fullPath: string, data: string) => {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);
        const created: DirectoryTree.File = {
            type: "File",
            name: path.basename(fullPath),
            path: fullPath
        }
        return created;
    });
    ipcMain.handle("file:open", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile"]
        });
        if(result.canceled) return null;
        return result.filePaths[0];
    });
    ipcMain.handle("file:copy", async (e, src: string, dest: string) => {
        await fs.copy(src, dest);
    });
    ipcMain.handle("file:assimpImporter", async (e, importPath: string) => {
        const importExt = path.extname(importPath).toLowerCase();
        if(importExt === ".fbx"){
            const jsonImportFile: Extract<Importer.JsonImportFile, { type: "assimp" }> = {
                type: "assimp",
                data: await assimpImporter(importPath)
            }
            return jsonImportFile;
        }
        else throw(`model file extension ${importExt} dont support`);
    });
    ipcMain.handle("file:getText", async (e, destPath: string) => {
        const file = await fs.readFile(destPath);
        return file.toString();
    });
    ipcMain.handle("file:openSave", async (e, fileName: string, data: string) => {
        const { filePath, canceled } = await dialog.showSaveDialog({
            defaultPath: fileName
        });
        if (canceled || !filePath) return null;
        await fs.writeFile(filePath, data);
        return filePath;
    });
    ipcMain.handle("file:save", async (e, destPath: string, data: string) => {
        await fs.writeFile(destPath, data);
    });
    ipcMain.handle("file:getSha256", async (e, path: string) => {
        const buffer = await fs.readFile(path);
        const hash = crypto.createHash("sha256");
        hash.update(buffer);
        const value = hash.digest("hex");
        return value;
    });
    ipcMain.handle("file:loadDataURL", async (e, path: string) => {
        const buffer = await fs.readFile(path);
        return `data:image/png;base64,${buffer.toString("base64")}`;
    });
    ipcMain.handle(
        "resource:saveMesh",
        async (e, destPath: string, mesh: Resource.Mesh) => {
            await saveMeshToBuffer(destPath, mesh);
        }
    );
    ipcMain.handle(
        "resource:loadMesh",
        async (e, destPath: string) => {
            return await readMeshBinary(destPath);
        }
    );
    ipcMain.handle(
        "resource:saveImage",
        async (e, destPath: string, imagePath: string) => {
            await saveImageToBuffer(destPath, imagePath);
        }
    );
    ipcMain.handle(
        "resource:loadImage",
        async (e, destPath: string) => {
            return await readImageBinary(destPath);
        }
    );

    // extensions
    if (!app.isPackaged){
        const reduxDevToolsPath = path.join(
            process.env.LOCALAPPDATA!,
            "Google",
            "Chrome",
            "User Data",
            "Default",
            "Extensions",
            "lmhkpmbekcpmknklioeibfkpmmfibljd",
            "3.2.10_0"
        );
        session.defaultSession.extensions.loadExtension(reduxDevToolsPath)
        .then(() => { console.log("added reduxDevTool extension!") })
        .catch((err) => { console.log("error while adding reduxDevTool: ", err) });
    }

    //
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length == 0) createWindow();
    });
    createWindow();
})
.catch(err => {
    console.error(err);
    app.quit();
});
app.on("window-all-closed", () => {
    if(process.platform !== 'darwin') app.quit();
});
