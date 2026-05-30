import type { Vec3 } from "@shot-engine/types";
import { getSceneWebglContext } from "../resource-manager-helper/CanvasHelper";
import { WebglTexture } from "../resource-manager-helper/WebglTexture";
import { getDenormalizeColor } from "../utils/utils";

export class ColorCache{
    private static _instance: ColorCache;
    static getInstance(){
        if(!this._instance) this._instance = new ColorCache(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _map: Map<string, WebglTexture>;
    private _usedKeys: Set<string>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._map = new Map();
        this._usedKeys = new Set<string>();
    }
    public createColorTexture(color: Vec3){
        const key = this.colorToKey(color);
        const curColorTexture = this._map.get(key);
        if(!curColorTexture){
            this._map.set(key, this._createWebglColorTexture(color));
        }
        this._usedKeys.add(key);
    }
    private colorToKey(color: Vec3){
        return `color:${color.x},${color.y},${color.z}`;
    }
    private _createWebglColorTexture(color: Vec3){
        color = getDenormalizeColor(color);
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
        return webglTexture;
    }
    public getWebglColorTexture(color: Vec3){
        const key = this.colorToKey(color);
        return this._map.get(key);
    }
    public deleteUnused(){
        const deleteKeys: string[] = [];
        for(const [key] of this._map){
            if(!this._usedKeys.has(key)) deleteKeys.push(key);
        }
        for(const deleteKey of deleteKeys){
            this._map.get(deleteKey)?.dispose();
            this._map.delete(deleteKey);
        }
        this._usedKeys.clear();
    }
    public getKeys(){
        return Array.from(this._map.keys());
    }
}