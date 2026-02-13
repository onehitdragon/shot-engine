import { WebglMesh } from "./WebglMesh";
import { getSceneWebglContext } from "./CanvasHelper";
import { isString } from "lodash";

export class WebglResourceManager{
    private static _instance: WebglResourceManager;
    static getInstance(){
        if(!this._instance) this._instance = new WebglResourceManager(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _fallbackWebglMesh: WebglMesh;
    private _webglMeshMap: Map<string, WebglMesh>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglMeshMap = new Map();
        this._fallbackWebglMesh = new WebglMesh(gl, {
            interleave: new Float32Array(),
            indices: new Uint32Array()
        });
    }
    public info(){
        return {
            meshCount: this._webglMeshMap.size
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
    public deleteMesh(guid: string){
        const webglMesh = this._webglMeshMap.get(guid);
        if(webglMesh){
            webglMesh.dispose();
            this._webglMeshMap.delete(guid);
        }
    }
    public deleteAll(){
        for(const guid of this._webglMeshMap.keys()){
            this.deleteMesh(guid);
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
}
