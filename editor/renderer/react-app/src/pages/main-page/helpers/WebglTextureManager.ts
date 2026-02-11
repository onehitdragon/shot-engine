import type { Assets } from "../../../engine-zod";
import { isEqual } from "lodash";

export class WebglTextureManager{
    private static _instance: WebglTextureManager;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglTextureManager(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _textureMap: Map<string, { webglTexture: WebGLTexture, asset: Assets.AssetImage }>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._textureMap = new Map();
    }
    public async update(
        assets: Record<string, Assets.MetaObject>,
        scene: SceneFormat.Scene | null
    ){
        // if(!scene || !scene.sceneGraph) return;
        // sceneGraphLooper(scene.sceneGraph.nodes, (sceneNode) => {
        //     const guidsInScene: string[] = [];
        //     const { components } = sceneNode;
        //     for(const component of components){
        //         if(component.type === "Shading" && component.shaderType === "phong"){
        //             guidsInScene.push(component.diffuse, component.normal);
        //         }
        //     }

        // });
    }
    private async add(assetImage: Assets.AssetImage, path: string){
        const { guid } = assetImage;
        let texture = this._textureMap.get(guid);
        if(!texture){
            await this.createTexture(assetImage, path);
        }
        else if(!isEqual(texture.asset, assetImage)){
            const gl = this._gl;
            gl.deleteTexture(texture.webglTexture);
            await this.createTexture(assetImage, path);
        }
    }
    private async createTexture(assetImage: Assets.AssetImage, path: string){
        const { guid, image } = assetImage;
        const texture = {
            asset: assetImage,
            webglTexture: await this.createWebglTexture(image, path)
        }
        this._textureMap.set(guid, texture);
    }
    private async createWebglTexture(image: Assets.Image, path: string){
        const gl = this._gl;
        const { width, height, data } = await window.api.file.readImage(path);
        const { imageType, wrapMode, filterMode, generateMipmaps } = image;
        const webglTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webglTexture);
        this.setWrapMode(wrapMode);
        this.setFilterMode(generateMipmaps, filterMode);
        if(imageType === "Texture"){
            const { sRGB, qualityLevel } = image;
            gl.texImage2D(gl.TEXTURE_2D, 0, sRGB ? gl.SRGB8_ALPHA8 : gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
            if(generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
        }
        else if(imageType === "NormalMap"){

        }
        else if(imageType === "LightMap"){

        }
        else throw `dont support ${imageType}`;
        gl.bindTexture(gl.TEXTURE_2D, null);
        return webglTexture;
    }
    private setWrapMode(wrapMode: Assets.Image["wrapMode"]){
        const gl = this._gl;
        if(wrapMode === "REPEAT"){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
        else if(wrapMode === "CLAMP"){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        else if(wrapMode === "MIRROR"){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        }
        else throw `dont support ${wrapMode}`
    }
    private setFilterMode(generateMipmaps: boolean, filterMode: Assets.Image["filterMode"]){
        const gl = this._gl;
        if(!generateMipmaps){
            if(filterMode === "NONE"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            else if(filterMode === "BILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else if(filterMode === "TRILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else throw `dont support ${filterMode}`
        }
        else{
            if(filterMode === "NONE"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            else if(filterMode === "BILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else if(filterMode === "TRILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else throw `dont support ${filterMode}`
        }
    }
}