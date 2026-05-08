import type { Asset, AssetManager, AssetType } from "@shot-engine/types";

export class AssetCache{
    private static _instance: AssetCache;
    static getInstance(){
        if(!this._instance) this._instance = new AssetCache();
        return this._instance;
    }
    private map: Map<string, {
        assetInfo: AssetManager.AssetInfo,
        asset?: Asset,
        usedThisFrame: boolean,
        updated: boolean
    }>;
    private constructor(){
        this.map = new Map();
    }
    public async createAssetCache(uuid: string, type: AssetType){
        let assetCache = this.map.get(uuid);
        if(!assetCache){
            const assetInfo = await window.api.assetManager.getAssetInfoFromUuid(uuid);
            if(!assetInfo) return;
            const asset = await window.api.assetManager.getAssetFromUuid(uuid, type);
            if(!asset) return;
            assetCache = { assetInfo, asset, usedThisFrame: true, updated: true }
            this.map.set(uuid, assetCache);
        }
        else{
            const assetInfo = await window.api.assetManager.getAssetInfoFromUuid(uuid);
            if(!assetInfo){
                this.map.delete(uuid);
                return;
            }
            if(assetCache.assetInfo.hash !== assetInfo.hash){
                const asset = await window.api.assetManager.getAssetFromUuid(uuid, type);
                if(!asset) return;
                assetCache.asset = asset;
                assetCache.assetInfo = assetInfo;
                assetCache.updated = true;
            }
            if(assetCache.assetInfo.property !== assetInfo.property){
                assetCache.assetInfo = assetInfo;
                assetCache.updated = true;
            }
        }
        assetCache.usedThisFrame = true;
        return assetCache;
    }
    public getAssetCache(uuid: string){
        return this.map.get(uuid);
    }
    public resetCacheState(){ // call after end frame
        const deleteKeys: string[] = [];
        for(const [key, value] of this.map){
            if(!value.usedThisFrame) deleteKeys.push(key);
            else{
                value.usedThisFrame = false;
            }
            value.updated = false;

            if(value.assetInfo.type === "mesh" || value.assetInfo.type === "image"){
                delete value.asset;
            }
        }
        for(const deleteKey of deleteKeys) this.map.delete(deleteKey);
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
