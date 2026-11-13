import { WebglMeshVBOs } from "./WebglMeshVBOs";
import { WebglHelper } from "./WebglHelper";
import type { MeshAsset } from "@shot-engine/types";

export class WebglMesh{
    private _gl: WebGL2RenderingContext;
    private _primitive: MeshAsset["primitives"][0];
    private _meshVBOs: WebglMeshVBOs;
    private _meshVAOCache?: { id: string, vao: WebGLVertexArrayObject };
    get meshVBOs(){
        return this._meshVBOs;
    }
    constructor(gl: WebGL2RenderingContext, primitive: MeshAsset["primitives"][0]){
        this._gl = gl;
        this._primitive = primitive;

        // create vbo
        this._meshVBOs = new WebglMeshVBOs(gl, primitive);
    }
    public getMeshVAO(
        id: string,
        vaoCreator: (gl: WebGL2RenderingContext, primitive: MeshAsset["primitives"][0], meshVBOs: WebglMeshVBOs) => WebGLVertexArrayObject
    ){
        const gl = this._gl;
        if(this._meshVAOCache){
            if(this._meshVAOCache.id === id) return this._meshVAOCache.vao;
            else WebglHelper.deleteVertexArray(gl, this._meshVAOCache.vao);
        }
        this._meshVAOCache = {
            id,
            vao: vaoCreator(gl, this._primitive, this._meshVBOs)
        }
        return this._meshVAOCache.vao;
    }
    dispose(){
        const gl = this._gl;
        this._meshVBOs.dispose();
        if(this._meshVAOCache) WebglHelper.deleteVertexArray(gl, this._meshVAOCache.vao);
    }
}