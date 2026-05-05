import * as fsWalk from '@nodelib/fs.walk';
import path from "node:path";
import fs from "fs-extra";
import xxhash, { type XXHashAPI } from "xxhash-wasm";
import { v4 as uuidv4 } from "uuid";
import * as schema from "./schema";
import { createDBIfNotExist, FileRow, AssetRow, closeDB } from "./db";
import * as ShotEngineType from "@shot-engine/types";
import { AssetManager } from "@shot-engine/types";
import { readGLBFile } from './glb';
import { readImageAsset, readMeshAsset, readPrefabAsset, saveImageAssetBinary, saveMeshAssetBinary, savePrefabAssetBinary } from './flatbf';
import { imageToRaw } from './imageToRaw';
import { createDefaultCubeAssetMesh } from './createDefaultAssetMesh';

let configed = false;
let ASSET_DIR = "";
let ASSET_DEFAULT_DIR = "";
let ASSET_GENERATED_DIR = "";

let filesQuery: ReturnType<typeof createDBIfNotExist>["filesQuery"] = {} as any;
let assetsQuery: ReturnType<typeof createDBIfNotExist>["assetsQuery"] = {} as any; 

export function config(config: AssetManager.Config){
    ASSET_DIR = config.assetDir;
    ASSET_DEFAULT_DIR = config.assetDefaultDir;
    ASSET_GENERATED_DIR = config.assetGenerateDir;
    const { filesQuery: filesQ, assetsQuery: assetsQ } = createDBIfNotExist(config.dbFilePath);
    filesQuery = filesQ;
    assetsQuery = assetsQ;
    configed = true;
}

export function close(){
    closeDB();
}

export function query(){
    function getAssetInfosFromPath(filePath: string){
        const relativePath = path.relative(ASSET_DIR, filePath);
        const assetInfos: AssetManager.AssetInfo[] = [];
        const fileRow = filesQuery.getByPath.get(relativePath);
        if(!fileRow){
            return assetInfos;
        };
        const assetRows = assetsQuery.getByFileId.all(fileRow.uuid);
        for(const assetRow of assetRows){
            assetInfos.push({
                uuid: assetRow.uuid,
                name: assetRow.name,
                type: assetRow.type,
                property: JSON.parse(assetRow.property),
                allowModify: assetRow.modifiable > 0
            });
        }
        return assetInfos;
    }
    function getAssetInfoFromUuid(uuid: string){
        const assetRow = assetsQuery.getById.get(uuid);
        if(!assetRow) return;
        const assetInfo: AssetManager.AssetInfo = {
            uuid: assetRow.uuid,
            name: assetRow.name,
            type: assetRow.type,
            property: JSON.parse(assetRow.property),
            allowModify: assetRow.modifiable > 0
        }
        return assetInfo;
    }
    function getAssetInfosFromType(type: ShotEngineType.AssetType){
        const assetInfos: AssetManager.AssetInfo[] = [];
        const assetRows = assetsQuery.getByType.all(type);
        for(const assetRow of assetRows){
            assetInfos.push({
                uuid: assetRow.uuid,
                name: assetRow.name,
                type: assetRow.type,
                property: JSON.parse(assetRow.property),
                allowModify: assetRow.modifiable > 0
            });
        }
        return assetInfos;
    }
    function getAssetFromUuid(uuid: string, type: ShotEngineType.AssetType){
        if(type === "other"){
            return;
        }
        const filePath = path.join(ASSET_GENERATED_DIR, uuid);
        if(type === "image"){
            return readImageAsset(filePath);
        }
        if(type === "mesh"){
            return readMeshAsset(filePath);
        }
        if(type === "prefab"){
            return readPrefabAsset(filePath);
        }
    }
    function updateAssetPropertyByUuid(uuid: string, property: string){
        assetsQuery.updateProperty.run(property, uuid);
    }
    function getFilePathFromAssetId(uuid: string){
        const assetRow = assetsQuery.getById.get(uuid);
        if(!assetRow) return;
        const fileRow = filesQuery.getById.get(assetRow.fileId);
        if(!fileRow) return;
        if(!fileRow.path) return;
        const fullPath = path.join(ASSET_DIR, fileRow.path);
        return fullPath;
    }
    return {
        getAssetInfosFromPath,
        getAssetInfoFromUuid,
        getAssetInfosFromType,
        getAssetFromUuid,
        updateAssetPropertyByUuid,
        getFilePathFromAssetId
    }
}

export async function rescan(){
    // let now = performance.now();
    // console.log(now, "ms");

    if(!configed) return;
    ensureDefaultFiles();

    const fileRowsDB = filesQuery.gets.all() as FileRow[];
    const hashCache = new Map<string, string>();
    for(const fileRow of fileRowsDB){
        if(!fileRow.path) continue;
        const fullPath = path.join(ASSET_DIR, fileRow.path);
        if(!fs.existsSync(fullPath)){
            filesQuery.updatePath.run(null, fileRow.uuid);
            fileRow.path = null;
            fileRow.dirty = true;
            continue;
        }
        const hash = await hashFile(fullPath);
        hashCache.set(fullPath, hash);
        if(fileRow.hash !== hash){
            filesQuery.updateHash.run(hash, fileRow.uuid);
            fileRow.hash = hash;
            fileRow.dirty = true;
        }
    }

    // console.log(performance.now() - now, "ms");
    // now = performance.now();

    const hashToFileRows = new Map<string, FileRow[]>();
    for(const fileRow of fileRowsDB){
        const exist = hashToFileRows.get(fileRow.hash);
        if(!exist) hashToFileRows.set(fileRow.hash, [fileRow]);
        else exist.push(fileRow);
    }
    const entries = fsWalk.walkSync(ASSET_DIR);
    for(const entry of entries){
        if(entry.dirent.isDirectory()) continue;
        const entryRelativePath = path.relative(ASSET_DIR, entry.path);
        const hash = hashCache.get(entry.path) || await hashFile(entry.path);
        let fileRows = hashToFileRows.get(hash);
        if(!fileRows){
            const fileRow: FileRow = {
                uuid: uuidv4(),
                hash,
                path: entryRelativePath,
                dirty: true
            }
            filesQuery.insert.run(fileRow.uuid, fileRow.hash, fileRow.path);
            hashToFileRows.set(fileRow.hash, [fileRow]);
            fileRowsDB.push(fileRow);
        }
        else if(!fileRows.some(e => e.path === entryRelativePath)){
            let updated = false;
            for(const fileRow of fileRows){
                if(!fileRow.path){
                    filesQuery.updatePath.run(entryRelativePath, fileRow.uuid);
                    fileRow.path = entryRelativePath;
                    fileRow.dirty = true;
                    updated = true;
                    break;
                }
            }
            if(!updated){
                const fileRow: FileRow = {
                    uuid: uuidv4(),
                    hash,
                    path: entryRelativePath,
                    dirty: true
                }
                filesQuery.insert.run(fileRow.uuid, fileRow.hash, fileRow.path);
                fileRows.push(fileRow);
                fileRowsDB.push(fileRow);
            }
        }
    }

    // console.log(performance.now() - now, "ms");
    // now = performance.now();

    const assetRowsDB = assetsQuery.gets.all() as AssetRow[];
    const fileIdToAssetRows = new Map<string, AssetRow[]>();
    for(const assetRow of assetRowsDB){
        const exist = fileIdToAssetRows.get(assetRow.fileId);
        if(!exist) fileIdToAssetRows.set(assetRow.fileId, [assetRow]);
        else exist.push(assetRow);
    }
    
    for(const fileRow of fileRowsDB){
        const assetRows = fileIdToAssetRows.get(fileRow.uuid) || [];
        if(!fileRow.path){
            filesQuery.delete.run(fileRow.uuid);
            for(const assetRow of assetRows) deleteGenAsset(assetRow.uuid);
        }
        else if(fileRow.dirty){
            if(isImageFile(fileRow.path)){
                await syncNotContainer(fileRow, assetRows, "image");
            }
            else if(isGLBFile(fileRow.path)){
                await syncGLBContainer(fileRow, assetRows);
            }
            else if(isMeshFile(fileRow.path)){
                await syncNotContainer(fileRow, assetRows, "mesh");
            }
            else if(isPrefabFile(fileRow.path)){
                await syncNotContainer(fileRow, assetRows, "prefab");
            }
            else{
                await syncNotContainer(fileRow, assetRows, "other");
            }
        }
    }

    // console.log(performance.now() - now, "ms");
    // now = performance.now();
}

function ensureDefaultFiles(){
    fs.ensureDirSync(ASSET_DEFAULT_DIR);
    const cubeAssetMeshPath = path.join(ASSET_DEFAULT_DIR, "cube-engine.mesh");
    if(!fs.existsSync(cubeAssetMeshPath)){
        const cubeAssetMesh = createDefaultCubeAssetMesh();
        saveMeshAssetBinary(cubeAssetMesh, cubeAssetMeshPath);
    }

    const set = new Set<string>([cubeAssetMeshPath]);
    const entries = fsWalk.walkSync(ASSET_DEFAULT_DIR);
    for(const entry of entries){
        if(!set.has(entry.path)) fs.removeSync(entry.path);
    }
}

let xxHashAPI: XXHashAPI | undefined;
async function hashFile(filePath: string){
    if(!xxHashAPI) xxHashAPI = await xxhash();
    const hash = xxHashAPI.create64();
    
    return new Promise<string>((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        stream.on("data", chunk => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest().toString()));
        stream.on("error", reject);
    });
}
async function hashImageAsset(imageAsset: ShotEngineType.ImageAsset) {
    if(!xxHashAPI) xxHashAPI = await xxhash();
    const hash = xxHashAPI.create64();
    
    hash.update(imageAsset.data);
    return hash.digest().toString();
}
async function hashMeshAsset(meshAsset: ShotEngineType.MeshAsset) {
    if(!xxHashAPI) xxHashAPI = await xxhash();
    const hash = xxHashAPI.create64();
    
    hash.update(new Uint8Array(Uint32Array.of(meshAsset.primitives.length).buffer));
    for(const prim of meshAsset.primitives){
        const { attribute, indices } = prim;
        const { positions, normals } = attribute;

        hash.update(new Uint8Array(Uint32Array.of(positions.length).buffer));
        hash.update(new Uint8Array(positions.buffer, positions.byteOffset, positions.byteLength));

        hash.update(new Uint8Array(Uint32Array.of(normals.length).buffer));
        hash.update(new Uint8Array(normals.buffer, normals.byteOffset, normals.byteLength));

        hash.update(new Uint8Array(Uint32Array.of(indices.length).buffer));
        hash.update(new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength));
    }
    return hash.digest().toString();
}
async function hashObject(object: Object) {
    if(!xxHashAPI) xxHashAPI = await xxhash();
    const hash = xxHashAPI.create64();
    
    hash.update(JSON.stringify(object));
    return hash.digest().toString(); 
}

async function syncNotContainer(fileRow: FileRow, assetRows: AssetRow[], type: AssetRow["type"]){
    if(!fileRow.path) return;
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    const isDefaultFile = fullPath.startsWith(ASSET_DEFAULT_DIR);
    const usedSet = new Set<string>();
    for(const assetRow of assetRows){
        if(assetRow.type !== type) continue;
        usedSet.add(assetRow.uuid);
        if(assetRow.hash !== fileRow.hash){
            assetsQuery.updateHash.run(fileRow.hash, assetRow.uuid);
            assetRow.hash = fileRow.hash;
            await genAssetWithFile(fileRow, assetRow, type);
        }
        const name = path.basename(fullPath || "");
        if(assetRow.name !== name){
            assetsQuery.updateName.run(name, assetRow.uuid);
            assetRow.name = name;
        }
        break;
    }
    if(usedSet.size === 0){
        const uuid = isDefaultFile ? path.basename(fullPath) : uuidv4();
        const assetRow: AssetRow = {
            uuid,
            fileId: fileRow.uuid,
            hash: fileRow.hash,
            type,
            name: path.basename(fileRow.path || ""),
            modifiable: 1,
            property: createAssetDefaultProterpty(type)
        };
        assetsQuery.insert.run(
            assetRow.uuid,
            assetRow.fileId,
            assetRow.hash,
            assetRow.type,
            assetRow.name,
            assetRow.modifiable,
            assetRow.property
        );
        usedSet.add(assetRow.uuid);
        assetRows.push(assetRow);
        await genAssetWithFile(fileRow, assetRow, type);
    }
    const uuids = assetRows.filter(e => !usedSet.has(e.uuid)).map(e => e.uuid);
    assetsQuery.deletesTransaction(uuids);
    uuids.forEach(e => deleteGenAsset(e))
}
async function syncGLBContainer(fileRow: FileRow, assetRows: AssetRow[]){
    if(!fileRow.path) return;
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    const glb = await readGLBFile(fullPath);
    if(!glb) return;
    const usedSet = new Set<string>();
    const { textures, meshes, prefabAssets } = glb;
    const textureAssetRows: AssetRow[] = [];
    const meshAssetRows: AssetRow[] = [];
    for(const texture of textures){
        const hash = await hashImageAsset(texture.imageAsset);
        const assetRow = assetRows.find(e => e.hash === hash);
        if(assetRow){
            usedSet.add(assetRow.uuid);
            textureAssetRows.push(assetRow);
        }
        else{
            const assetRow: AssetRow = {
                uuid: uuidv4(),
                fileId: fileRow.uuid,
                hash,
                type: "image",
                name: path.basename(fileRow.path) + "/" + texture.name,
                modifiable: 0,
                property: createAssetDefaultProterpty("image")
            };
            assetsQuery.insert.run(
                assetRow.uuid,
                assetRow.fileId,
                assetRow.hash,
                assetRow.type,
                assetRow.name,
                assetRow.modifiable,
                assetRow.property
            );
            usedSet.add(assetRow.uuid);
            textureAssetRows.push(assetRow);
            assetRows.push(assetRow);
            genImageAsset(assetRow, texture.imageAsset);
        }
    }
    for(const mesh of meshes){
        const hash = await hashMeshAsset(mesh.meshAsset);
        const assetRow = assetRows.find(e => e.hash === hash);
        if(assetRow){
            usedSet.add(assetRow.uuid);
            meshAssetRows.push(assetRow);
        }
        else{
            const assetRow: AssetRow = {
                uuid: uuidv4(),
                fileId: fileRow.uuid,
                hash,
                type: "mesh",
                name: path.basename(fileRow.path) + "/" + mesh.name,
                modifiable: 0,
                property: createAssetDefaultProterpty("mesh")
            };
            assetsQuery.insert.run(
                assetRow.uuid,
                assetRow.fileId,
                assetRow.hash,
                assetRow.type,
                assetRow.name,
                assetRow.modifiable,
                assetRow.property
            );
            usedSet.add(assetRow.uuid);
            meshAssetRows.push(assetRow);
            assetRows.push(assetRow);
            genMeshAsset(assetRow, mesh.meshAsset);
        }
    }
    function updateGameObjectDependency(go: ShotEngineType.GameObject){
        for(const component of go.components){
            if(component.type === "Mesh"){
                component.meshRef = meshAssetRows[Number(component.meshRef)].uuid;
            }
        }
        for(const child of go.childs) updateGameObjectDependency(child as ShotEngineType.GameObject);
    }
    for(const prefabAsset of prefabAssets){
        updateGameObjectDependency(prefabAsset.root);
    }
    for(const prefabAsset of prefabAssets){
        const hash = await hashObject(prefabAsset);
        const assetRow = assetRows.find(e => e.hash === hash);
        if(assetRow){
            usedSet.add(assetRow.uuid);
        }
        else{
            const assetRow: AssetRow = {
                uuid: uuidv4(),
                fileId: fileRow.uuid,
                hash,
                type: "prefab",
                name: path.basename(fileRow.path) + "/" + prefabAsset.root.name,
                modifiable: 0,
                property: createAssetDefaultProterpty("prefab")
            };
            assetsQuery.insert.run(
                assetRow.uuid,
                assetRow.fileId,
                assetRow.hash,
                assetRow.type,
                assetRow.name,
                assetRow.modifiable,
                assetRow.property
            );
            usedSet.add(assetRow.uuid);
            assetRows.push(assetRow);
            genPrefabAsset(assetRow, prefabAsset);
        }
    }

    const uuids = assetRows.filter(e => !usedSet.has(e.uuid)).map(e => e.uuid);
    assetsQuery.deletesTransaction(uuids);
    uuids.forEach(e => deleteGenAsset(e))
}
function createAssetDefaultProterpty(type: AssetRow["type"]){
    if(type === "image"){
        return schema.defaultImageAssetJSON;
    }
    else if(type === "mesh"){
        return schema.defaultMeshAssetJSON;
    }
    else if(type === "prefab"){
        return schema.defaultPrefabAssetJSON;
    }
    else{
        return schema.defaultOtherAssetJSON;
    }
}

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg"]);
function isImageFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTS.has(ext);
}
function isGLBFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".glb";
}
function isMeshFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".mesh";
}
function isPrefabFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".prefab";
}

async function genAssetWithFile(fileRow: FileRow, assetRow: AssetRow, type: AssetRow["type"]) {
    if(!fileRow.path) return;
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    if(type === "image"){
        const raw = await imageToRaw(fs.readFileSync(fullPath));
        const imageAsset: ShotEngineType.ImageAsset = {
            width: raw.info.width,
            height: raw.info.height,
            data: raw.data
        }
        genImageAsset(assetRow, imageAsset);
    }
    else if(type === "mesh"){
        genAssetFromFile(fileRow, assetRow);
    }
    else if(type === "prefab"){
        genAssetFromFile(fileRow, assetRow);
    }
    else genDefaultAsset(fileRow, assetRow);
}
function genAssetFromFile(fileRow: FileRow, assetRow: AssetRow){
    if(!fileRow.path) return;
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.uuid);
    fs.copyFileSync(fullPath, genAssetPath);
}
function genDefaultAsset(fileRow: FileRow, assetRow: AssetRow){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.uuid);
    const file = fs.openSync(genAssetPath, "w");
    fs.writeSync(file, `
        ${new Date().toLocaleTimeString()} \r\n todo: content of file ${fileRow.path}
        ${assetRow.type} ${assetRow.name}
    `);
    fs.closeSync(file);
}
function genImageAsset(assetRow: AssetRow, imageAsset: ShotEngineType.ImageAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.uuid);
    saveImageAssetBinary(imageAsset, genAssetPath);
}
function genMeshAsset(assetRow: AssetRow, meshAsset: ShotEngineType.MeshAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.uuid);
    saveMeshAssetBinary(meshAsset, genAssetPath);
}
function genPrefabAsset(assetRow: AssetRow, prefabAsset: ShotEngineType.PrefabAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.uuid);
    savePrefabAssetBinary(prefabAsset, genAssetPath);
}
function deleteGenAsset(uuid: string){
    const genAssetPath = path.join(ASSET_GENERATED_DIR, uuid);
    fs.removeSync(genAssetPath);
}
