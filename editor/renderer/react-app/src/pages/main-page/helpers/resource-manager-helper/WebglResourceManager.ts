import { WebglMesh } from "./WebglMesh";
import { getSceneWebglContext } from "./CanvasHelper";
import { isString } from "lodash";
import { WebglTexture } from "./WebglTexture";
import { createTexture, type Assets } from "../../../../engine-zod";

export class WebglResourceManager{
    private static _instance: WebglResourceManager;
    static getInstance(){
        if(!this._instance) this._instance = new WebglResourceManager(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglMeshMap: Map<string, WebglMesh>;
    private _webglTextureMap: Map<string, WebglTexture>;
    private _fallbackWebglMesh: WebglMesh;
    private _fallbackWebglTexture: WebglTexture;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglMeshMap = new Map();
        this._webglTextureMap = new Map();
        this._fallbackWebglMesh = new WebglMesh(gl, {
            interleave: new Float32Array(),
            indices: new Uint32Array()
        });
        this._fallbackWebglTexture = new WebglTexture(
            gl,
            {
                width: 1,
                height: 1,
                data: new Uint8Array([255, 0, 255, 255])
            },
            createTexture()
        );
    }
    public info(){
        return {
            meshCount: this._webglMeshMap.size,
            textureCount: this._webglTextureMap.size,
        }
    }
    public updateMesh(guid: string, meshResource: Resource.MeshBin){
        const gl = this._gl;
        const webglMesh = this._webglMeshMap.get(guid);
        if(webglMesh){
            webglMesh.dispose();
        }
        const newWebglMesh = new WebglMesh(gl, meshResource);
        this._webglMeshMap.set(guid, newWebglMesh);
    }
    public updateTexture(guid: string, imageResource: Resource.ImageBin, image: Assets.Image){
        const gl = this._gl;
        const webglTexture = this._webglTextureMap.get(guid);
        if(webglTexture){
            webglTexture.dispose();
        }
        const newWebglTexture = new WebglTexture(gl, imageResource, image);
        this._webglTextureMap.set(guid, newWebglTexture);
    }
    public deleteMesh(guid: string){
        const webglMesh = this._webglMeshMap.get(guid);
        if(webglMesh){
            webglMesh.dispose();
            this._webglMeshMap.delete(guid);
        }
    }
    public deleteTexture(guid: string){
        const webglTexture = this._webglTextureMap.get(guid);
        if(webglTexture){
            webglTexture.dispose();
            this._webglTextureMap.delete(guid);
        }
    }
    public deleteAll(){
        for(const guid of this._webglMeshMap.keys()){
            this.deleteMesh(guid);
        }
        for(const guid of this._webglTextureMap.keys()){
            this.deleteTexture(guid);
        }
    }
    public getWebglMesh(guid: string): WebglMesh;
    public getWebglMesh(component: Components.Mesh): WebglMesh;
    public getWebglMesh(para: string | Components.Mesh){
        let guid: string;
        if(isString(para)){
            guid = para;
        }
        else{
            const component = para;
            if(component.meshType === "PrimitiveMesh") guid = component.primitiveType;
            else if(component.meshType === "ImportMesh") guid = component.guid;
            else throw "cant find guid";
        }
        const webglMesh = this._webglMeshMap.get(guid);
        if(!webglMesh) return this._fallbackWebglMesh;
        return webglMesh;
    }
    public getWebglTexture(guid: string): WebGLTexture{
        const webglTexture = this._webglTextureMap.get(guid);
        if(!webglTexture) return this._fallbackWebglTexture;
        return webglTexture;
    }
}
