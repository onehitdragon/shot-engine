import * as fsWalk from '@nodelib/fs.walk';
import path from "node:path";
import fs from "fs-extra";
import xxhash, { type XXHashAPI } from "xxhash-wasm";
import { v4 as uuidv4 } from "uuid";
import * as schema from "./schema.js";
import { createDBIfNotExist, FileRow, AssetRow, closeDB } from "./db.js";
import * as ShotEngineType from "@shot-engine/types";
import { AssetManager } from "@shot-engine/types";
import { readGLBFile } from './glb.js';
import { readFontAsset, readHdrAsset, readImageAsset, readMaterialAsset, readMeshAsset, readPrefabAsset, readProjectSettingAsset, readSceneAsset, saveFontAssetBinary, saveHdrAssetBinary, saveImageAssetBinary, saveMaterialAssetBinary, saveMeshAssetBinary, savePrefabAssetBinary } from './flatbf.js';
import { createDefaultConeAssetMesh, createDefaultCubeAssetMesh, createDefaultCylinderAssetMesh, createDefaultSimpleMaterialAsset, createDefaultSphereAssetMesh } from './createDefaultAssetMesh.js';
import * as assetBakers from './assetBakers.js';
import { createKTXImageAsset } from './helpers/create-ktx-image-asset.js';

let configed = false;
let ASSET_DIR = "";
let ASSET_DEFAULT_DIR = "";
let ASSET_GENERATED_DIR = "";
let BUILD_DIR = "";

let filesQuery: ReturnType<typeof createDBIfNotExist>["filesQuery"] = {} as any;
let assetsQuery: ReturnType<typeof createDBIfNotExist>["assetsQuery"] = {} as any; 

/**
 * require call before open project folder
 */
export function config(config: AssetManager.Config){
    ASSET_DIR = config.assetDir; // "Assets"
    ASSET_DEFAULT_DIR = config.assetDefaultDir; // "Assets/.default"
    ASSET_GENERATED_DIR = config.assetGenerateDir; // "Engine/Resource"
    BUILD_DIR = config.buildDir;
    const { filesQuery: filesQ, assetsQuery: assetsQ } = createDBIfNotExist(config.dbFilePath); // "Engine/sqlite3.db"
    filesQuery = filesQ;
    assetsQuery = assetsQ;
    configed = true;
}
export function getConfig(){
    return {
        ASSET_DIR, ASSET_DEFAULT_DIR, ASSET_GENERATED_DIR, BUILD_DIR
    }
}
export function close(){
    closeDB();
}

// path helpers
function getAssetGenPath(assetUuid: string){
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetUuid);
    return genAssetPath;
}

export function query(){
    function getFileIdFromPath(filePath: string){
        const relativePath = path.relative(ASSET_DIR, filePath);
        const fileRow = filesQuery.getByPath.get(relativePath);
        return fileRow?.uuid;
    }
    function getAssetInfoFromPath(filePath: string){
        const relativePath = path.relative(ASSET_DIR, filePath);
        const fileRow = filesQuery.getByPath.get(relativePath);
        if(!fileRow) return;
        const assetRow = assetsQuery.getByFileId.get(fileRow.uuid);
        if(!assetRow) return;
        const assetInfo: AssetManager.AssetInfo = {
            uuid: assetRow.fileId,
            name: assetRow.name,
            type: assetRow.type,
            hash: assetRow.hash,
            property: assetRow.property,
            allowModify: assetRow.modifiable > 0
        }
        return assetInfo;
    }
    function getAssetInfoFromRelativePath(relativePath: string){
        const fileRow = filesQuery.getByPath.get(relativePath);
        if(!fileRow) return;
        const assetRow = assetsQuery.getByFileId.get(fileRow.uuid);
        if(!assetRow) return;
        const assetInfo: AssetManager.AssetInfo = {
            uuid: assetRow.fileId,
            name: assetRow.name,
            type: assetRow.type,
            hash: assetRow.hash,
            property: assetRow.property,
            allowModify: assetRow.modifiable > 0
        }
        return assetInfo;
    }
    function getAssetInfoFromUuid(uuid: string){
        const assetRow = assetsQuery.getByFileId.get(uuid);
        if(!assetRow) return;
        const assetInfo: AssetManager.AssetInfo = {
            uuid: assetRow.fileId,
            name: assetRow.name,
            type: assetRow.type,
            hash: assetRow.hash,
            property: assetRow.property,
            allowModify: assetRow.modifiable > 0
        }
        return assetInfo;
    }
    function getAssetInfosFromType(type: ShotEngineType.AssetType){
        const assetInfos: AssetManager.AssetInfo[] = [];
        const assetRows = assetsQuery.getByType.all(type);
        for(const assetRow of assetRows){
            assetInfos.push({
                uuid: assetRow.fileId,
                name: assetRow.name,
                type: assetRow.type,
                hash: assetRow.hash,
                property: assetRow.property,
                allowModify: assetRow.modifiable > 0
            });
        }
        return assetInfos;
    }
    function getAssetFromUuid(uuid: string, type: ShotEngineType.AssetType){
        const filePath = path.join(ASSET_GENERATED_DIR, uuid);
        if(type === "other"){
            return { content: fs.readFileSync(filePath).toString() } as ShotEngineType.OtherAsset;
        }
        if(type === "image"){
            return readImageAsset(filePath);
        }
        if(type === "material"){
            return readMaterialAsset(filePath);
        }
        if(type === "mesh"){
            return readMeshAsset(filePath);
        }
        if(type === "prefab"){
            return readPrefabAsset(filePath);
        }
        if(type === "scene"){
            return readSceneAsset(filePath);
        }
        if(type === "hdr"){
            return readHdrAsset(filePath);
        }
        if(type === "setting"){
            return readProjectSettingAsset(filePath);
        }
        if(type === "font"){
            return readFontAsset(filePath);
        }
        if(type === "text"){
            return { text: fs.readFileSync(filePath).toString() } as ShotEngineType.TextAsset;
        }
    }
    async function updateAssetPropertyByUuid(uuid: string, property: string){
        assetsQuery.updateProperty.run(property, uuid);
        const assetRow = assetsQuery.getByFileId.get(uuid);
        if(!assetRow) throw "missing assetRow";
        const fileRow = filesQuery.getById.get(assetRow.fileId);
        if(!fileRow) throw "missing fileRow";
        await genAssetWithFile(fileRow, assetRow, assetRow.type);
    }
    function getFilePathFromAssetId(uuid: string){
        const assetRow = assetsQuery.getByFileId.get(uuid);
        if(!assetRow) return;
        const fileRow = filesQuery.getById.get(assetRow.fileId);
        if(!fileRow) return;
        if(!fileRow.path) return;
        const fullPath = path.join(ASSET_DIR, fileRow.path);
        return fullPath;
    }
    function addBakedHdrAsset(uuid: string, hdrAsset: ShotEngineType.HdrAsset){
        const assetRow = assetsQuery.getByFileId.get(uuid);
        if(!assetRow || assetRow.type !== "hdr") return;
        genHdrAsset(assetRow, hdrAsset);
    }
    async function bakeFontAsset(uuid: string, fontAssetBakeSetting: ShotEngineType.FontAssetBakeSetting){
        const assetRow = assetsQuery.getByFileId.get(uuid);
        if(!assetRow || assetRow.type !== "font") throw "bad asset";
        const filePath = getFilePathFromAssetId(uuid);
        if(!filePath) throw "cant find file path"
        const fontAsset = await assetBakers.bakeFontAsset(filePath, fontAssetBakeSetting);
        genFontAsset(assetRow, fontAsset);
    }
    return {
        getFileIdFromPath,
        getAssetInfoFromPath,
        getAssetInfoFromRelativePath,
        getAssetInfoFromUuid,
        getAssetInfosFromType,
        getAssetFromUuid,
        updateAssetPropertyByUuid,
        getFilePathFromAssetId,
        addBakedHdrAsset,
        bakeFontAsset
    }
}

export function tool(){
    async function importFile(importPath: string, destFolder: string){
        if(isGLBFile(importPath)){
            const destGlbFolder = path.join(destFolder, path.parse(importPath).name + "-glb");
            await fs.ensureDir(destGlbFolder);

            // extract files from glb and save
            const glb = await readGLBFile(importPath);
            const { imageAssets, materialAssets, meshAssets, prefabAssets } = glb;
            const glbIdToPath = new Map<string, string>();
            for(const [glbId, glbImage] of imageAssets){
                const imagePath = path.join(destGlbFolder, glbImage.name);
                await fs.writeFile(imagePath, glbImage.raw);
                glbIdToPath.set(glbId, imagePath);
            }
            for(const [glbId, glbMat] of materialAssets){
                const materialPath = path.join(destGlbFolder, glbMat.name);
                saveMaterialAssetBinary(glbMat.materialAsset, materialPath);
                glbIdToPath.set(glbId, materialPath);
            }
            for(const [glbId, glbMesh] of meshAssets){
                const meshPath = path.join(destGlbFolder, glbMesh.name);
                saveMeshAssetBinary(glbMesh.meshAsset, meshPath);
                glbIdToPath.set(glbId, meshPath);
            }
            for(const glbPrefab of prefabAssets){
                const prefabPath = path.join(destGlbFolder, glbPrefab.name);
                savePrefabAssetBinary(glbPrefab.prefabAsset, prefabPath);
            }
            await rescan();

            // helper
            const glbIdToFileId = (glbId?: string) => {
                if(!glbId) return glbId;
                const filePath = glbIdToPath.get(glbId);
                if(!filePath) return;
                return query().getFileIdFromPath(filePath);
            }

            // update properties
            for(const [glbId, glbImage] of imageAssets){
                const fileId = glbIdToFileId(glbId);
                if(!fileId) continue;
                await query().updateAssetPropertyByUuid(fileId, JSON.stringify(glbImage.property));
            }

            // link assets
            for(const [_, glbMat] of materialAssets){
                const { materialAsset } = glbMat;
                if(materialAsset.matType === "pbr"){
                    materialAsset.baseTextureRef = glbIdToFileId(materialAsset.baseTextureRef);
                    materialAsset.metallicRoughnessTextureRef = glbIdToFileId(materialAsset.metallicRoughnessTextureRef);
                    materialAsset.normalTextureRef = glbIdToFileId(materialAsset.normalTextureRef);
                    materialAsset.emissiveTextureRef = glbIdToFileId(materialAsset.emissiveTextureRef);
                    materialAsset.occlusionTextureRef = glbIdToFileId(materialAsset.occlusionTextureRef);
                }
                const materialPath = path.join(destGlbFolder, glbMat.name);
                saveMaterialAssetBinary(glbMat.materialAsset, materialPath);
            }
            const goLooper = (go: ShotEngineType.GameObject) => {
                for(const component of go.components){
                    if(component.type === "MeshRenderer" || component.type === "SkinnedMeshRenderer"){
                        component.meshRef = glbIdToFileId(component.meshRef);
                        for(let i = 0; i < component.materialRefs.length; i++){
                            component.materialRefs[i] = glbIdToFileId(component.materialRefs[i]);
                        }
                    }
                }
                for(const child of go.childs){
                    if(ShotEngineType.isGameObjectPrefab(child)) continue;
                    goLooper(child);
                }
            }
            for(const glbPrefab of prefabAssets){
                goLooper(glbPrefab.prefabAsset.root);
                const prefabPath = path.join(destGlbFolder, glbPrefab.name);
                savePrefabAssetBinary(glbPrefab.prefabAsset, prefabPath);
            }
            await rescan();
        }
        else{
            const importName = path.basename(importPath);
            const destPath = path.join(destFolder, importName);
            await fs.copyFile(importPath, destPath);
            await rescan();
        }
    }
    return {
        importFile
    }
}

export async function rescan(){
    if(!configed) return;
    await ensureDefaultFiles();

    // using (path and hash) to scan folder
    /** check db first
     * loop db files
     * check the db path vs the real path(exist or not)
     * if(not) remove the db path of db files -> continue
     * if(exist) calculate real hash and save to hashCache<real path, real hash>
     * check the db hash vs the real hash (equal or not)
     * if(not) update db hash = real hash
     */
    const fileRowsDB = filesQuery.gets.all();
    // <the fullPath of file exists in db and real, old hash or new hash>
    const hashCache = new Map<string, string>(); // <real path, real hash>
    for(const fileRow of fileRowsDB){
        if(!fileRow.path) continue;
        const fullPath = path.join(ASSET_DIR, fileRow.path);
        if(!fs.existsSync(fullPath)){ // file exist in db but not in real (rename, move, deleted)
            filesQuery.updatePath.run(null, fileRow.uuid);
            fileRow.path = null;
            fileRow.dirty = true;
            continue;
        }
        const hash = await hashFile(fullPath);
        hashCache.set(fullPath, hash);
        if(fileRow.hash !== hash){ // file exist in db and real but different content (modify)
            filesQuery.updateHash.run(hash, fileRow.uuid);
            fileRow.hash = hash;
            fileRow.dirty = true;
        }
    }

    /** group db files with hash
     * now fileRowsDB is (real hash, real path)
     * many files -> one hash
     */
    const hashToFileRows = new Map<string, FileRow[]>();
    for(const fileRow of fileRowsDB){
        const exist = hashToFileRows.get(fileRow.hash);
        if(!exist) hashToFileRows.set(fileRow.hash, [fileRow]);
        else exist.push(fileRow);
    }
    
    // walk through the whole asset folder
    const entries = fsWalk.walkSync(ASSET_DIR);
    for(const entry of entries){
        if(entry.dirent.isDirectory()) continue;
        const isDefaultFile = entry.path.startsWith(ASSET_DEFAULT_DIR);
        const entryRelativePath = path.relative(ASSET_DIR, entry.path);
        const hash = hashCache.get(entry.path) || await hashFile(entry.path);
        let fileRows = hashToFileRows.get(hash);
        if(!fileRows){ // is new hash or new file
            const fileRow: FileRow = {
                uuid: isDefaultFile ? path.basename(entry.path) : uuidv4(),
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
                if(!fileRow.path){ // rename case, move case
                    filesQuery.updatePath.run(entryRelativePath, fileRow.uuid);
                    fileRow.path = entryRelativePath;
                    fileRow.dirty = true;
                    updated = true;
                    break;
                }
            }
            if(!updated){ // new file
                const fileRow: FileRow = {
                    uuid: isDefaultFile ? path.basename(entry.path) : uuidv4(),
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

    const assetRowsDB = assetsQuery.gets.all();
    const fileIdToAssetRow = new Map<string, AssetRow>(); // one file -> one asset
    for(const assetRow of assetRowsDB){
        fileIdToAssetRow.set(assetRow.fileId, assetRow);
    }
    
    for(const fileRow of fileRowsDB){
        let assetRow = fileIdToAssetRow.get(fileRow.uuid); // asset of this file
        if(!fileRow.path){ // file removed
            filesQuery.delete.run(fileRow.uuid); // also auto delete asset row link to this file
            if(assetRow) deleteGenAsset(assetRow.fileId); // delete generated resource
            continue;
        }
        if(fileRow.dirty){
            // sync asset rows
            if(isImageFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "image");
            }
            else if(isMaterialFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "material");
            }
            else if(isMeshFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "mesh");
            }
            else if(isPrefabFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "prefab");
            }
            else if(isSceneFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "scene");
            }
            else if(isHdrFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "hdr");
            }
            else if(isSettingFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "setting");
            }
            else if(isFontFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "font");
            }
            else if(isTextFile(fileRow.path)){
                assetRow = await syncAssetRow(fileRow, assetRow, "text");
            }
            else{
                assetRow = await syncAssetRow(fileRow, assetRow, "other");
            }
            // file is dirty -> delete generated resource
            deleteGenAsset(assetRow.fileId);
        }
        // check missing resource and regenerate
        if(!assetRow) throw "missing assetRow";
        if(fs.existsSync(getAssetGenPath(assetRow.fileId))) continue;
        if(isImageFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "image");
        }
        else if(isMaterialFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "material");
        }
        else if(isMeshFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "mesh");
        }
        else if(isPrefabFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "prefab");
        }
        else if(isSceneFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "scene");
        }
        else if(isHdrFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "hdr");
        }
        else if(isSettingFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "setting");
        }
        else if(isFontFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "font");
        }
        else if(isTextFile(fileRow.path)){
            await genAssetWithFile(fileRow, assetRow, "text");
        }
        else{
            await genAssetWithFile(fileRow, assetRow, "other");
        }
    }

    // console.log(performance.now() - now, "ms");
    // now = performance.now();
}
async function ensureDefaultFiles(){
    // just create default asset file not resources
    fs.ensureDirSync(ASSET_DEFAULT_DIR);

    // mesh
    const cubeAssetMeshPath = path.join(ASSET_DEFAULT_DIR, "cube-engine.mesh");
    if(!fs.existsSync(cubeAssetMeshPath)){
        const cubeAssetMesh = await createDefaultCubeAssetMesh();
        saveMeshAssetBinary(cubeAssetMesh, cubeAssetMeshPath);
    }
    const sphereAssetMeshPath = path.join(ASSET_DEFAULT_DIR, "sphere-engine.mesh");
    if(!fs.existsSync(sphereAssetMeshPath)){
        const sphereAssetMesh = await createDefaultSphereAssetMesh();
        saveMeshAssetBinary(sphereAssetMesh, sphereAssetMeshPath);
    }
    const cylinderAssetMeshPath = path.join(ASSET_DEFAULT_DIR, "cylinder-engine.mesh");
    if(!fs.existsSync(cylinderAssetMeshPath)){
        const cylinderAssetMesh = await createDefaultCylinderAssetMesh();
        saveMeshAssetBinary(cylinderAssetMesh, cylinderAssetMeshPath);
    }
    const coneAssetMeshPath = path.join(ASSET_DEFAULT_DIR, "cone-engine.mesh");
    if(!fs.existsSync(coneAssetMeshPath)){
        const assetMesh = await createDefaultConeAssetMesh();
        saveMeshAssetBinary(assetMesh, coneAssetMeshPath);
    }

    // material
    const simpleMaterialAssetPath = path.join(ASSET_DEFAULT_DIR, "simple-material-engine.mat");
    if(!fs.existsSync(simpleMaterialAssetPath)){
        const materialAsset = createDefaultSimpleMaterialAsset([1, 1, 1]);
        saveMaterialAssetBinary(materialAsset, simpleMaterialAssetPath);
    }
    const redSimpleMaterialAssetPath = path.join(ASSET_DEFAULT_DIR, "red-simple-material-engine.mat");
    if(!fs.existsSync(redSimpleMaterialAssetPath)){
        const materialAsset = createDefaultSimpleMaterialAsset([1, 0, 0]);
        saveMaterialAssetBinary(materialAsset, redSimpleMaterialAssetPath);
    }
    const greenSimpleMaterialAssetPath = path.join(ASSET_DEFAULT_DIR, "green-simple-material-engine.mat");
    if(!fs.existsSync(greenSimpleMaterialAssetPath)){
        const materialAsset = createDefaultSimpleMaterialAsset([0, 1, 0]);
        saveMaterialAssetBinary(materialAsset, greenSimpleMaterialAssetPath);
    }
    const blueSimpleMaterialAssetPath = path.join(ASSET_DEFAULT_DIR, "blue-simple-material-engine.mat");
    if(!fs.existsSync(blueSimpleMaterialAssetPath)){
        const materialAsset = createDefaultSimpleMaterialAsset([0, 0, 1]);
        saveMaterialAssetBinary(materialAsset, blueSimpleMaterialAssetPath);
    }

    // remove other files in ASSET_DEFAULT_DIR
    const set = new Set<string>([
        cubeAssetMeshPath, // mesh
        sphereAssetMeshPath,
        cylinderAssetMeshPath,
        coneAssetMeshPath,
        simpleMaterialAssetPath, // material
        redSimpleMaterialAssetPath,
        greenSimpleMaterialAssetPath,
        blueSimpleMaterialAssetPath,
    ]);
    const entries = fsWalk.walkSync(ASSET_DEFAULT_DIR);
    for(const entry of entries){
        if(!set.has(entry.path)) fs.removeSync(entry.path);
    }
}

// hash helpers
let xxHashAPI: XXHashAPI | undefined;
export async function hashFile(filePath: string){
    if(!xxHashAPI) xxHashAPI = await xxhash();
    const hash = xxHashAPI.create64();
    
    return new Promise<string>((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        stream.on("data", chunk => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest().toString()));
        stream.on("error", reject);
    });
}

/**
 * @param assetRows assets of the file row, this function can add to it, not remove from it
 */
async function syncAssetRow(fileRow: FileRow, assetRow: AssetRow | undefined, type: AssetRow["type"]){
    if(!fileRow.path) throw "missing fileRow.path";
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    const isDefaultFile = fullPath.startsWith(ASSET_DEFAULT_DIR);
    if(!assetRow){
        assetRow = {
            fileId: fileRow.uuid,
            hash: fileRow.hash,
            type,
            name: path.basename(fileRow.path || ""),
            modifiable: isDefaultFile ? 0 : 1,
            property: createAssetDefaultProterpty(type)
        };
        assetsQuery.insert.run(
            assetRow.fileId,
            assetRow.hash,
            assetRow.type,
            assetRow.name,
            assetRow.modifiable,
            assetRow.property
        );
    }
    else{
        if(assetRow.type !== type){
            assetsQuery.updateType.run(fileRow.hash, assetRow.fileId);
            assetRow.hash = fileRow.hash;
        }
        if(assetRow.hash !== fileRow.hash){
            assetsQuery.updateHash.run(fileRow.hash, assetRow.fileId);
            assetRow.hash = fileRow.hash;
        }
        // update asset name if fileRow have changed path
        const name = path.basename(fullPath || "");
        if(assetRow.name !== name){
            assetsQuery.updateName.run(name, assetRow.fileId);
            assetRow.name = name;
        }
    }
    return assetRow;
}
function createAssetDefaultProterpty(type: AssetRow["type"]): string{
    if(type === "image"){
        return schema.defaultImageAssetJSON;
    }
    if(type === "material"){
        return schema.defaultMaterialAssetJSON;
    }
    else if(type === "mesh"){
        return schema.defaultMeshAssetJSON;
    }
    else if(type === "prefab"){
        return schema.defaultPrefabAssetJSON;
    }
    else if(type === "scene"){
        return schema.defaultSceneAssetJSON;
    }
    else if(type === "hdr"){
        return schema.defaultHdrAssetJSON;
    }
    else if(type === "setting"){
        return schema.defaultSettingAssetJSON;
    }
    else if(type === "font"){
        return schema.defaultFontAssetJSON;
    }
    else if(type === "text"){
        return schema.defaultTextAssetJSON;
    }
    else{
        return schema.defaultOtherAssetJSON;
    }
}

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg"]);
const TEXT_EXTS = new Set([".txt", ".html", ".css", ".js"]);
function isImageFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTS.has(ext);
}
function isMaterialFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".mat";
}
function isMeshFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".mesh";
}
function isPrefabFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".prefab";
}
function isSceneFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".scene";
}
function isHdrFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".hdr";
}
function isSettingFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".setting";
}
function isFontFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".ttf";
}
function isTextFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return TEXT_EXTS.has(ext);
}
function isGLBFile(filePath: string){
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".glb";
}

// call when update asset property, change file, new file
async function genAssetWithFile(fileRow: FileRow, assetRow: AssetRow, type: AssetRow["type"]){
    if(!fileRow.path) return;
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    if(type === "image"){
        const imageAsset = await createKTXImageAsset(fullPath, JSON.parse(assetRow.property));
        genImageAsset(assetRow, imageAsset);
    }
    else if(type === "material"){
        // client using assetManager.saveMaterialAssetBinary to change .mat file
        // and call rescan to active this function
        genAssetFromFile(fileRow, assetRow);
    }
    else if(type === "mesh"){
        genAssetFromFile(fileRow, assetRow);
    }
    else if(type === "prefab"){
        genAssetFromFile(fileRow, assetRow);
    }
    else if(type === "scene"){
        genAssetFromFile(fileRow, assetRow);
    }
    else if(type === "hdr"){
        // ignore
        // only create assetRow not gen asset file
    }
    else if(type === "setting"){
        genAssetFromFile(fileRow, assetRow);
    }
    else if(type === "font"){
        // ignore
        // only create assetRow not gen asset file
    }
    else if(type === "text"){
        genAssetFromFile(fileRow, assetRow);
    }
    else genDefaultAsset(fileRow, assetRow);
}

// gen asset helpers
// just copy origin file
function genAssetFromFile(fileRow: FileRow, assetRow: AssetRow){
    if(!fileRow.path) return;
    const fullPath = path.join(ASSET_DIR, fileRow.path);
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    fs.copyFileSync(fullPath, genAssetPath);
    // update time of generated file
    const now = new Date();
    fs.utimesSync(genAssetPath, now, now);
}
function genDefaultAsset(fileRow: FileRow, assetRow: AssetRow){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    const file = fs.openSync(genAssetPath, "w");
    fs.writeSync(file, `
        ${new Date().toLocaleTimeString()} \r\n todo: content of file ${fileRow.path}
        ${assetRow.type} ${assetRow.name}
    `);
    fs.closeSync(file);
}
function genImageAsset(assetRow: AssetRow, imageAsset: ShotEngineType.ImageAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    saveImageAssetBinary(imageAsset, genAssetPath);
}
function genMaterialAsset(assetRow: AssetRow, matAsset: ShotEngineType.MaterialAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    saveMaterialAssetBinary(matAsset, genAssetPath);
}
function genMeshAsset(assetRow: AssetRow, meshAsset: ShotEngineType.MeshAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    saveMeshAssetBinary(meshAsset, genAssetPath);
}
function genPrefabAsset(assetRow: AssetRow, prefabAsset: ShotEngineType.PrefabAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    savePrefabAssetBinary(prefabAsset, genAssetPath);
}
function genHdrAsset(assetRow: AssetRow, hdrAsset: ShotEngineType.HdrAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    saveHdrAssetBinary(hdrAsset, genAssetPath);
}
function genFontAsset(assetRow: AssetRow, fontAsset: ShotEngineType.FontAsset){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    saveFontAssetBinary(fontAsset, genAssetPath);
}
function genTextAsset(assetRow: AssetRow, text: string){
    fs.ensureDirSync(ASSET_GENERATED_DIR);
    const genAssetPath = path.join(ASSET_GENERATED_DIR, assetRow.fileId);
    const file = fs.openSync(genAssetPath, "w");
    fs.writeSync(file, text);
    fs.closeSync(file);
}
function deleteGenAsset(uuid: string){
    const genAssetPath = path.join(ASSET_GENERATED_DIR, uuid);
    fs.removeSync(genAssetPath);
}
