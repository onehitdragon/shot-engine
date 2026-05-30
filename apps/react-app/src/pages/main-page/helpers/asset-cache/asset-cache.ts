import type { Asset, AssetManager, AssetType, HdrAsset, ImageAsset, MeshAsset } from "@shot-engine/types";
import { WebglMesh } from "../resource-manager-helper/WebglMesh";
import { WebglTexture } from "../resource-manager-helper/WebglTexture";
import { getSceneWebglContext } from "../resource-manager-helper/CanvasHelper";
import { WebglTextureCube } from "../resource-manager-helper/WebglTextureCube";

type AssetCacheItem = {
    assetInfo: AssetManager.AssetInfo,
    asset?: Asset,
    webglResource?: {
        webglMeshes?: WebglMesh[],
        webglTexture?: WebglTexture,
        webglTextureCube?: WebglTextureCube
    }
}
type AssetCacheState = {
    state: "new",
    newAssetCache: AssetCacheItem
} | {
    state: "updated",
    updatedAssetCache: AssetCacheItem
} | {
    state: "deleted",
    deletedCacheItem: AssetCacheItem
} | {
    state: "none"
}
export class AssetCache{
    private static _instance: AssetCache;
    static getInstance(){
        if(!this._instance) this._instance = new AssetCache(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private map: Map<string, AssetCacheItem>;
    private usedKeys: Set<string>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this.map = new Map();
        this.usedKeys = new Set<string>();
    }
    public async createAssetCache(uuid: string, type: AssetType){
        let curAssetCache = this.map.get(uuid);
        let state: AssetCacheState;
        if(!curAssetCache){
            const assetInfo = await window.api.assetManager.getAssetInfoFromUuid(uuid);
            if(!assetInfo){
                state = { state: "none" };
            }
            else{
                const asset = await window.api.assetManager.getAssetFromUuid(uuid, type);
                const newAssetCache = { assetInfo, asset }
                this.map.set(uuid, newAssetCache);
                state = { state: "new", newAssetCache };
            }
        }
        else{
            if(this.usedKeys.has(uuid)){
                state = { state: "none" };
            }
            else{
                const assetInfo = await window.api.assetManager.getAssetInfoFromUuid(uuid);
                if(!assetInfo){
                    state = { state: "deleted", deletedCacheItem: curAssetCache };
                }
                else{
                    state = { state: "none" };
                    if(curAssetCache.assetInfo.hash !== assetInfo.hash){
                        const asset = await window.api.assetManager.getAssetFromUuid(uuid, type);
                        curAssetCache.asset = asset;
                        curAssetCache.assetInfo = assetInfo;
                        state = { state: "updated", updatedAssetCache: curAssetCache };
                    }
                    if(curAssetCache.assetInfo.property !== assetInfo.property){
                        curAssetCache.assetInfo = assetInfo;
                        state = { state: "updated", updatedAssetCache: curAssetCache };
                    }
                }
            }
        }
        this.usedKeys.add(uuid);

        if(state.state === "none"){
            return curAssetCache;
        }
        if(state.state === "new"){
            this._createWebglResoure(state.newAssetCache);
            return state.newAssetCache;
        }
        if(state.state === "updated"){
            this._disposeWebglResoure(state.updatedAssetCache);
            this._createWebglResoure(state.updatedAssetCache);
            return state.updatedAssetCache;
        }
        if(state.state === "deleted"){
            this._disposeWebglResoure(state.deletedCacheItem);
            return;
        }
    }
    private _createWebglResoure(assetCacheItem: AssetCacheItem){
        const type = assetCacheItem.assetInfo.type;
        if(type === "mesh"){
            assetCacheItem.webglResource = {
                webglMeshes: this._createWebglMeshes(assetCacheItem)
            }
        }
        if(type === "image"){
            assetCacheItem.webglResource = {
                webglTexture: this._createWebglTexture(assetCacheItem)
            }
        }
        if(type === "hdr"){
            assetCacheItem.webglResource = {
                webglTextureCube: this._createWebglTextureCube(assetCacheItem)
            }
        }
    }
    private _createWebglMeshes(assetCacheItem: AssetCacheItem){
        const meshAsset = assetCacheItem.asset as MeshAsset | undefined;
        if(!meshAsset) return;
        const webglMeshes: WebglMesh[] = [];
        for(const prim of meshAsset.primitives){
            webglMeshes.push(new WebglMesh(this._gl, prim));
        }
        return webglMeshes;
    }
    private _createWebglTexture(assetCacheItem: AssetCacheItem){
        const imageAsset = assetCacheItem.asset as ImageAsset | undefined;
        if(!imageAsset) return;
        const assetInfo = assetCacheItem.assetInfo;
        const webglTexture = new WebglTexture(
            this._gl, imageAsset, JSON.parse(assetInfo.property)
        );
        return webglTexture;
    }
    private _createWebglTextureCube(assetCacheItem: AssetCacheItem){
        const hdrAsset = assetCacheItem.asset as HdrAsset | undefined;
        if(!hdrAsset) return;
        const webglTextureCube = new WebglTextureCube(
            this._gl,
            [
                hdrAsset.enviromentMap.right,
                hdrAsset.enviromentMap.left,
                hdrAsset.enviromentMap.top,
                hdrAsset.enviromentMap.bottom,
                hdrAsset.enviromentMap.font,
                hdrAsset.enviromentMap.back,
            ]
        );
        return webglTextureCube;
    }
    private _disposeWebglResoure(assetCacheItem?: AssetCacheItem){
        assetCacheItem?.webglResource?.webglMeshes?.forEach(e => e.dispose());
        assetCacheItem?.webglResource?.webglTexture?.dispose();
        assetCacheItem?.webglResource?.webglTextureCube?.dispose();
    }
    public getAssetCache(uuid: string){
        return this.map.get(uuid);
    }
    public getWebglMeshes(uuid: string){
        return this.map.get(uuid)?.webglResource?.webglMeshes;
    }
    public getWebglTexture(uuid: string){
        return this.map.get(uuid)?.webglResource?.webglTexture;
    }
    public getWebglTextureCube(uuid: string){
        return this.map.get(uuid)?.webglResource?.webglTextureCube;
    }
    public deleteUnused(){
        const deleteKeys: string[] = [];
        for(const [key] of this.map){
            if(!this.usedKeys.has(key)) deleteKeys.push(key);
        }
        for(const deleteKey of deleteKeys){
            this._disposeWebglResoure(this.map.get(deleteKey));
            this.map.delete(deleteKey);
        }
        this.usedKeys.clear();
    }
    public getCountRecord(){
        const countMap = new Map<AssetType, AssetManager.AssetInfo[]>();
        for(const v of this.map.values()){
            const current = countMap.get(v.assetInfo.type);
            if(!current){
                countMap.set(v.assetInfo.type, [v.assetInfo]);
            }
            else{
                current.push(v.assetInfo);
            }
        }
        const countRecord: [AssetType, AssetManager.AssetInfo[]][] = [];
        for(const kv of countMap){
            countRecord.push(kv);
        }
        return countRecord;
    }
}
