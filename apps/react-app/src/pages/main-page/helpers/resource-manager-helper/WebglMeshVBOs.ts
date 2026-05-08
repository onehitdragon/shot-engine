import type { MeshAsset } from "@shot-engine/types";
import { WebglHelper } from "./WebglHelper";

export class WebglMeshVBOs{
    private _gl: WebGL2RenderingContext;
    private _vertexVBO: WebGLBuffer;
    private _indexVBO: WebGLBuffer;
    private _indexType: number;
    private _indexCount: number;
    private _drawMode: number;
    get vertexVBO(){
        return this._vertexVBO;
    }
    get indexVBO(){
        return this._indexVBO;
    }
    get indexType(){
        return this._indexType;
    }
    get indexCount(){
        return this._indexCount;
    }
    get drawMode(){
        return this._drawMode;
    }
    constructor(gl: WebGL2RenderingContext, primitive: MeshAsset["primitives"][0]){
        this._gl = gl;
        this._vertexVBO = WebglHelper.createVertexBuffer(gl, primitive.attribute.interleaveArray);
        this._indexVBO = WebglHelper.createIndexBuffer(gl, primitive.indices);
        this._indexType = primitive.indexType;
        this._indexCount = primitive.indices.length;
        this._drawMode = primitive.drawMode;
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