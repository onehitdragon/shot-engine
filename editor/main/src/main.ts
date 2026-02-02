import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import fs, { FSWatcher } from "fs-extra";
import { showConfirmDialog, showErrorDialog } from "./message-boxes";
import trash from "trash";
import { assimpImporter } from "./importer/assimp/assimp-importer";
import crypto from "crypto";
import ktxParser from "ktx-parse";
import { Worker } from "worker_threads";
import { ensureMetaFile } from "./my-watcher/my-watcher";
import * as fsWalk from '@nodelib/fs.walk';
import { Entry } from "@nodelib/fs.walk";

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
    ipcMain.handle("folder:ensureMetaFile", async (e, projectPath: string) => {
        await ensureMetaFile(projectPath);
    });
    ipcMain.handle("folder:load", async (e, folderPath: string) => {
        const entries = await new Promise<Entry[]>((rel, rej) => {
            fsWalk.walk(
                folderPath,
                { entryFilter: e => !e.name.endsWith(".meta.json") },
                (err, entries) => {
                    if(err) rej(err);
                    rel(entries);
                }
            );
        });
        const directory: DirectoryTree.Directory = {
            type: "Directory",
            name: path.basename(folderPath),
            path: folderPath,
            children: []
        };
        const entryMap = new Map<string, DirectoryTree.Directory | DirectoryTree.File>();
        entryMap.set(directory.path, directory);
        for(const entry of entries){
            const parent = entryMap.get(entry.dirent.parentPath);
            if(!parent || parent.type === "File") continue;
            let child: DirectoryTree.Directory | DirectoryTree.File;
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
            parent.children.push(child);
            entryMap.set(entry.path, child);
        }
        return Array.from(entryMap.values());
    });
    const watcherMap = new Map<string, FSWatcher>();
    ipcMain.handle( "folder:watch", async (e, folderPath: string) => {
        let watcher = watcherMap.get(folderPath);
        if(watcher) watcher.close();
        watcher = fs.watch(folderPath);
        watcher.on("change", () => {
            e.sender.send("folder:onWatchEvent");
        });
        watcherMap.set(folderPath, watcher);
    });
    ipcMain.handle("folder:unwatch", async (e, folderPath: string) => {
        const watcher = watcherMap.get(folderPath);
        if(!watcher) return;
        watcher.close();
        watcherMap.delete(folderPath);
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
        try{
            if(recycle){
                await trash([path]);
                return true;
            }
            else{
                if(await showConfirmDialog("Delete permanent?")){
                    await fs.rm(path, { recursive: true, force: true });
                    return true;
                }
            }
        }
        catch(err){
            return false;
        }
        return false;
    });
    ipcMain.handle("file:silentDelete", async (e, path: string, recycle: boolean) => {
        if(recycle){
            await trash([path]);
        }
        else{
            await fs.rm(path, { recursive: true, force: true });
        }
    });
    ipcMain.handle("folder:create", async (e, parentPath: string, name: string) => {
        try{
            const fullPath = path.join(parentPath, name);
            await fs.mkdir(fullPath, { recursive: true });
            const created: DirectoryTree.Directory = {
                type: "Directory",
                name: name,
                path: fullPath,
                children: []
            }
            return created;
        }
        catch(err){
            return null;
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
    ipcMain.handle("file:import", async (e, importPath: string, destFolder: string) => {
        try{
            const importExt = path.extname(importPath).toLowerCase();
            if(importExt === ".fbx"){
                const importName = path.basename(importPath) + ".json";
                const fullPath = path.join(destFolder, importName);
                const jsonImportFile: Importer.JsonImportFile = {
                    type: "assimp",
                    data: await assimpImporter(importPath)
                }
                await fs.writeFile(fullPath, `${JSON.stringify(jsonImportFile, (key, value) => {
                    return typeof value === "bigint" ? value.toString() : value;
                }, 2)} \n`);
                const created: DirectoryTree.File = {
                    type: "File",
                    name: importName,
                    path: fullPath
                }
                return created;
            }
            else if(importExt === ".png" || importExt === ".jpg"){
                const importName = path.basename(importPath);
                const fullPath = path.join(destFolder, importName);
                await fs.copyFile(importPath, fullPath, fs.constants.COPYFILE_EXCL);
                const created: DirectoryTree.File = {
                    type: "File",
                    name: importName,
                    path: fullPath
                }
                return created;
            }
            else throw(`file extension ${importExt} dont support`);
        }
        catch(err){
            await showErrorDialog(String(err));
            return false;
        }
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
    ipcMain.handle(
        "ktx2:createTextureKTX2",
        async (e, sourcePath: string, destPath: string, metaHash: string, settings: KTX2.TextureKTX2Settings) => {
            const worker = new Worker(
                path.join(__dirname, "importer", "ktx-encode", "ktx-encoder.js"),
                {
                    workerData: { sourcePath, destPath, settings }
                }
            )
            await new Promise<void>((resolve, reject) => {
                worker.once("exit", () => { resolve() });
                worker.once("error", (err) => { reject(err) });
            });
            const ktx = ktxParser.read(await fs.readFile(destPath));
            ktx.keyValue["metaHash"] = new TextEncoder().encode(metaHash);
            await fs.writeFile(destPath, ktxParser.write(ktx));
            const created: DirectoryTree.File = {
                type: "File",
                name: path.basename(destPath),
                path: destPath
            }
            return created;
        }
    );
    ipcMain.handle("ktx2:getMetaHash", async (e, path: string) => {
        const ktx = ktxParser.read(await fs.readFile(path));
        const buffer = ktx.keyValue["metaHash"] as Uint8Array<ArrayBufferLike>;
        const metaHash = new TextDecoder().decode(buffer);
        return metaHash;
    });

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
