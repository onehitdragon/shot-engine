import type { MeshAsset } from "@shot-engine/types";
import { getSceneWebglContext } from "../resource-manager-helper/CanvasHelper";
import { WebglMesh } from "../resource-manager-helper/WebglMesh";
import { AssetCache } from "./asset-cache";

type WebglMeshCacheType = {
    webglMeshes: WebglMesh[],
    usedThisFrame: boolean
}
export class WebglMeshCache{
    private static _instance: WebglMeshCache;
    static getInstance(){
        if(!this._instance) this._instance = new WebglMeshCache(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglMeshMap: Map<string, WebglMeshCacheType>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglMeshMap = new Map();
    }
    public async createWebglMeshes(assetId: string){
        const assetCache = await AssetCache.getInstance().createAssetCache(assetId, "mesh");
        const webglMeshCache = this._webglMeshMap.get(assetId);
        if(!assetCache){
            this.disposeWebglMeshes(webglMeshCache);
            console.warn("cant find asset with assetId:", assetId);
            return;
        }
        else if(assetCache.updated){
            this.disposeWebglMeshes(webglMeshCache);
            if(!assetCache.asset){
                console.warn("error while getting asset cache", assetId);
                return;
            }
            const meshAsset = assetCache.asset as MeshAsset;
            const webglMeshes: WebglMesh[] = [];
            for(const prim of meshAsset.primitives){
                webglMeshes.push(new WebglMesh(this._gl, prim));
            }
            this._webglMeshMap.set(assetId, { webglMeshes, usedThisFrame: true });
            return webglMeshes;
        }

        if(!webglMeshCache){
            console.warn("cant find webglmesh with assetId:", assetId);
            return;
        }
        webglMeshCache.usedThisFrame = true;
        return webglMeshCache.webglMeshes;
    }
    private disposeWebglMeshes(webglMeshCache?: WebglMeshCacheType | null){
        if(webglMeshCache){
            webglMeshCache.webglMeshes.forEach(e => e.dispose());
        }
    }
    public getWebglMeshes(assetId: string){
        return this._webglMeshMap.get(assetId)?.webglMeshes;
    }
    public resetCacheState(){ // call after end frame
        const deleteKeys: string[] = [];
        const deletes: WebglMeshCacheType[] = [];
        for(const [key, value] of this._webglMeshMap){
            if(!value.usedThisFrame){
                deleteKeys.push(key);
                deletes.push(value);
            }
            else value.usedThisFrame = false;
        }
        deletes.forEach(e => this.disposeWebglMeshes(e));
        deleteKeys.forEach(e => this._webglMeshMap.delete(e));
    }
}
