import fsPath from "path";
import chokidar from 'chokidar';
import fs from "fs-extra";
import { Dirent } from "fs";
import { AssetFileSchema, AssetFolderSchema, AssetImageSchema, Assets, createAssetImage } from "./engine-zod";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import * as fsWalk from '@nodelib/fs.walk';
import { Entry } from "@nodelib/fs.walk";

export async function ensureMetaFile(dirPath: string){
    const assetsPath = fsPath.join(dirPath, "Assets");
    await fs.ensureDir(assetsPath);
    const ktxPath = fsPath.join(dirPath, "Library", "KTX");
    await fs.ensureDir(ktxPath);

    let dirty = false;
    const watcher = chokidar.watch(dirPath, { ignoreInitial: true });
    watcher.on("all", () => {
        dirty = true;
    });
    let assetMap: Record<string, Assets.MetaObject> = {};
    const reopen = async () => {
        try{
            do{
                dirty = false;
                assetMap = await syncMetaFile(assetsPath);
            }
            while(dirty);
        }
        catch(err){
            throw err;
        }
        finally{
            await watcher.close();
        }
    };
    await reopen();
    return assetMap;
}
async function syncMetaFile(dirPath: string){
    // process meta file before build tree
    // scan folder
    // with a meta file
    // -> if the assetPath dont exists, remove the meta file.
    // -> else, check format of the meta file, rewriting if need.
    // with a asset file
    // -> if having a meta file in metaMap, do nothing
    // -> else, create new a meta file
    // await fs.readdir(dirPath, { withFileTypes: true });
    const entries = await new Promise<Entry[]>((rel, rej) => {
        fsWalk.walk(dirPath, (err, e) => {
            if(err) rej(err);
            rel(e);
        });
    });
    const entryMap = new Map<string, Dirent<string>>(
        entries.map(e => [e.path, e.dirent])
    );
    const metaSet = new Set<string>(); // asset path
    const assetMap: Record<string, Assets.MetaObject> = {}
    const assets: Dirent<string>[] = [];
    for(const entry of entries){
        const fullPath = entry.path;
        if(entry.dirent.isDirectory()){
            assets.push(entry.dirent);
        }
        else{
            if(entry.name.endsWith(".meta.json")){
                const metaPath = fullPath;
                const assetPath = entry.path.replace(".meta.json", "");
                await processMetaFile(metaPath, assetPath, entryMap, metaSet, assetMap);
            }
            else{
                assets.push(entry.dirent);
            }
        }
    }
    for(const entry of assets){
        const assetPath = fsPath.join(entry.parentPath, entry.name);
        await verifyMetaFile(assetPath, entryMap, metaSet, assetMap);
    }
    await MyWatcherSingleton.runMetaTasks();
    return assetMap;
}
async function processMetaFile(
    metaPath: string,
    assetPath: string,
    entryMap: Map<string, Dirent<string>>,
    metaSet: Set<string>, // asset path
    assetMap: Record<string, Assets.MetaObject> // guid, meta path
){
    const assetEntry = entryMap.get(assetPath);
    if(!assetEntry){
        MyWatcherSingleton.metaTasks.push(
            fs.rm(metaPath, { recursive: true, force: true })
        );
        // console.log(`${metaPath} is unnessary`);
        return;
    } 
    let metaObject: Assets.Asset;
    try{
        metaObject = await fs.readJSON(metaPath);
    }
    catch(err){
        metaObject = {} as any;
    }
    let guid: string;
    if(uuidValidate(metaObject["guid"])) guid = metaObject["guid"];
    else guid = uuidv4();
    if(pathIsImage(assetPath)){
        const z0 = await AssetImageSchema.safeParseAsync(metaObject);
        if(!z0.success){
            const newMetaObject = createAssetImage();
            MyWatcherSingleton.metaTasks.push(
                fs.writeFile(metaPath, JSON.stringify(newMetaObject, null, 2))
            );
            metaObject = newMetaObject;
            // console.log(`image ${metaPath} is bad`);
        }
    }
    else{
        const z0 = await AssetFolderSchema.safeParseAsync(metaObject);
        const z1 = await AssetFileSchema.safeParseAsync(metaObject);
        if(!z0.success && !z1.success){
            if(assetEntry.isDirectory()){
                const newMetaObject: Assets.AssetFolder = {
                    guid,
                    isFolder: true
                };
                MyWatcherSingleton.metaTasks.push(
                    fs.writeFile(metaPath, JSON.stringify(newMetaObject, null, 2))
                );
                metaObject = newMetaObject;
                // console.log(`folder ${metaPath} is bad`);
            }
            else{
                const newMetaObject: Assets.AssetFile = {
                    guid,
                    isFolder: false
                };
                MyWatcherSingleton.metaTasks.push(
                    fs.writeFile(metaPath, JSON.stringify(newMetaObject, null, 2))
                );
                metaObject = newMetaObject;
                // console.log(`file ${metaPath} is bad`);
            }
        }
    }
    metaSet.add(assetPath);
    assetMap[guid] = {
        path: assetPath,
        asset: metaObject
    };
}
async function verifyMetaFile(
    assetPath: string,
    entryMap: Map<string, Dirent<string>>,
    metaSet: Set<string>, // asset path
    assetMap: Record<string, Assets.MetaObject> // guid, meta path
){
    if(metaSet.has(assetPath)) return;
    const metaPath = assetPath + ".meta.json";
    let metaObject: Assets.Asset;
    if(pathIsImage(assetPath)){
        const newMetaObject = createAssetImage();
        MyWatcherSingleton.metaTasks.push(
            fs.writeFile(metaPath, JSON.stringify(newMetaObject, null, 2))
        );
        metaObject = newMetaObject;
        // console.log(`create image ${metaPath}`);
    }
    else{
        const assetEntry = entryMap.get(assetPath);
        if(!assetEntry) throw "my-watcher error";
        if(assetEntry.isDirectory()){
            const newMetaObject: Assets.AssetFolder = {
                guid: uuidv4(),
                isFolder: true
            };
            MyWatcherSingleton.metaTasks.push(
                fs.writeFile(metaPath, JSON.stringify(newMetaObject, null, 2))
            );
            metaObject = newMetaObject;
            // console.log(`create folder ${metaPath}`);
        }
        else{
            const newMetaObject: Assets.AssetFile = {
                guid: uuidv4(),
                isFolder: false
            };
            MyWatcherSingleton.metaTasks.push(
                fs.writeFile(metaPath, JSON.stringify(newMetaObject, null, 2))
            );
            metaObject = newMetaObject;
            // console.log(`create file ${metaPath}`);
        }
    }
    metaSet.add(assetPath);
    assetMap[metaObject.guid] = {
        path: assetPath,
        asset: metaObject
    };
}
function pathIsImage(path: string){
    const ext = fsPath.extname(path).toLowerCase();
    return ext === ".png" || ext === ".jpg";
}
class MyWatcherSingleton{
    public static metaTasks: Promise<void>[] = [];
    public static async runMetaTasks(){
        await Promise.all(this.metaTasks);
        this.metaTasks = [];
    }
}
