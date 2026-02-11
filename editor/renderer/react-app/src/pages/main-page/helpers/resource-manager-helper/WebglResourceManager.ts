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
    private _webglMeshMap: Map<string, WebglMesh>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglMeshMap = new Map();
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
        if(!webglMesh) throw "cant find meshId: " + guid;
        return webglMesh;
    }
}
