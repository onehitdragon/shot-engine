import type { ImageAsset, Vec3 } from "@shot-engine/types";
import { getSceneWebglContext } from "../resource-manager-helper/CanvasHelper";
import { WebglTexture } from "../resource-manager-helper/WebglTexture";
import { AssetCache } from "./asset-cache";
import { getDenormalizeColor } from "../utils/utils";

type WebglTextureCacheType = {
    webglTexture: WebglTexture,
    usedThisFrame: boolean
}
export class WebglTextureCache{
    private static _instance: WebglTextureCache;
    static getInstance(){
        if(!this._instance) this._instance = new WebglTextureCache(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglTextureMap: Map<string, WebglTextureCacheType>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglTextureMap = new Map();
    }
    public async createWebglTexture(assetId: string){
        const assetCache = await AssetCache.getInstance().createAssetCache(assetId, "image");
        const webglTextureCache = this._webglTextureMap.get(assetId);
        if(!assetCache){
            webglTextureCache?.webglTexture.dispose();
            console.warn("cant find asset with assetId:", assetId);
            return;
        }
        else if(assetCache.updated){
            webglTextureCache?.webglTexture.dispose();
            if(!assetCache.asset){
                console.warn("error while getting asset cache", assetId);
                return;
            }
            const imageAsset = assetCache.asset as ImageAsset;
            const webglTexture = new WebglTexture(this._gl, imageAsset, JSON.parse(assetCache.assetInfo.property));
            this._webglTextureMap.set(assetId, { webglTexture, usedThisFrame: true });
            return webglTexture;
        }

        if(!webglTextureCache){
            console.warn("cant find webgltexture with assetId:", assetId);
            return;
        }
        webglTextureCache.usedThisFrame = true;
        return webglTextureCache.webglTexture;
    }
    public getWebglTexture(assetId: string){
        return this._webglTextureMap.get(assetId)?.webglTexture;
    }
    public resetCacheState(){ // call after end frame
        const deleteKeys: string[] = [];
        const deletes: WebglTextureCacheType[] = [];
        for(const [key, value] of this._webglTextureMap){
            if(!value.usedThisFrame){
                deleteKeys.push(key);
                deletes.push(value);
            }
            else value.usedThisFrame = false;
        }
        deletes.forEach(e => e.webglTexture.dispose());
        deleteKeys.forEach(e => this._webglTextureMap.delete(e));
    }
    private colorToKey(color: Vec3){
        return `color:${color.x},${color.y},${color.z}`;
    }
    public getWebglColorTexture(color: Vec3){
        color = getDenormalizeColor(color);
        const key = this.colorToKey(color);
        const webglTextureCache = this._webglTextureMap.get(key);
        if(!webglTextureCache){
            const webglTexture = new WebglTexture(
                this._gl,
                {
                    width: 1, height: 1, data: new Uint8Array([color.x, color.y, color.z, 255])
                },
                {
                    type: "image",
                    imageType: "Texture",
                    sRGB: false,
                    filterMode: "NONE",
                    generateMipmaps: false,
                    qualityLevel: 0,
                    wrapMode: "REPEAT"
                }
            );
            this._webglTextureMap.set(key, { webglTexture, usedThisFrame: true });
            return webglTexture;
        }
        webglTextureCache.usedThisFrame = true;
        return webglTextureCache.webglTexture;
    }
}