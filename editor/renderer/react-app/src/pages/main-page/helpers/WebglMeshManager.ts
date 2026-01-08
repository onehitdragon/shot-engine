import { WebglMesh } from "./WebglMesh";

export class WebglMeshManager{
    private static _instance: WebglMeshManager;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglMeshManager(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglMeshMap: Map<string, WebglMesh>;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglMeshMap = new Map<string, WebglMesh>();
    }
    update(meshes: SceneFormat.Mesh[]){
        console.log(meshes.length);
        const gl = this._gl;
        const addeds: SceneFormat.Mesh[] = [];
        const removeds: string[] = [];
        const commingIds = new Set<string>();
        for(const mesh of meshes){
            const { id } = mesh;
            if(!this._webglMeshMap.has(id)) addeds.push(mesh);
            commingIds.add(id);
        }
        for(const id of this._webglMeshMap.keys()){
            if(!commingIds.has(id)) removeds.push(id);
        }
        for(const mesh of addeds){
            const webglMesh = new WebglMesh(gl, mesh);
            this._webglMeshMap.set(mesh.id, webglMesh);
        }
        for(const id of removeds){
            const webglMesh = this._webglMeshMap.get(id)!;
            webglMesh.dispose();
            this._webglMeshMap.delete(id);
        }
    }
    getWebglMesh(meshId: string){
        const webglMesh = this._webglMeshMap.get(meshId);
        if(!webglMesh) throw "cant find meshId: " + meshId;
        return webglMesh;
    }
}