import { WebglHelper } from "./WebglHelper";

export class WebglMeshVBOs{
    private _gl: WebGL2RenderingContext;
    private _vertexVBO: WebGLBuffer;
    private _indexVBO: WebGLBuffer;
    private _indexCount: number;
    get vertexVBO(){
        return this._vertexVBO;
    }
    get indexVBO(){
        return this._indexVBO;
    }
    get indexCount(){
        return this._indexCount;
    }
    constructor(gl: WebGL2RenderingContext, meshResource: Resource.MeshBin){
        this._gl = gl;
        this._vertexVBO = WebglHelper.createVertexBuffer(gl, meshResource.interleave);
        this._indexVBO = WebglHelper.createIndexBuffer(gl, meshResource.indices);
        this._indexCount = meshResource.indices.length;
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