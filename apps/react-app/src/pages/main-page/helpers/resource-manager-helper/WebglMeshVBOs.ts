import type { MeshAsset } from "@shot-engine/types";
import { WebglHelper } from "./WebglHelper";

export class WebglMeshVBOs{
    private _gl: WebGL2RenderingContext;
    private _vertexVBO: WebGLBuffer;
    private _indexVBO: WebGLBuffer;
    get vertexVBO(){
        return this._vertexVBO;
    }
    get indexVBO(){
        return this._indexVBO;
    }
    constructor(gl: WebGL2RenderingContext, primitive: MeshAsset["primitives"][0]){
        this._gl = gl;
        this._vertexVBO = WebglHelper.createVertexBuffer(gl, primitive.attribute.interleaveArray.buffer);
        this._indexVBO = WebglHelper.createIndexBuffer(gl, primitive.indices.buffer);
    }
    bindVertexVBO(){
        const gl = this._gl;
        WebglHelper.bindVertexBuffer(gl, this._vertexVBO);
    }
    bindIndexVBO(){
        const gl = this._gl;
        WebglHelper.bindIndexBuffer(gl, this._indexVBO);
    }
    dispose(){
        const gl = this._gl;
        WebglHelper.deleteVertexBuffer(gl, this._vertexVBO);
        WebglHelper.deleteVertexBuffer(gl, this._indexVBO);
    }
}