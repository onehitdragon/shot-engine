import { WebglHelper } from "./WebglHelper";

export class WebglMeshVBOs{
    private _gl: WebGL2RenderingContext;
    private _vertexVBO: WebGLBuffer;
    private _indexVBO: WebGLBuffer;
    private _normalVBO: WebGLBuffer;
    private _vertices: Float32Array;
    private _vertexIndices: Uint32Array;
    private _normals: Float32Array
    get vertexVBO(){
        return this._vertexVBO;
    }
    get indexVBO(){
        return this._indexVBO;
    }
    get normalVBO(){
        return this._normalVBO;
    }
    get vertices(){
        return this._vertices;
    }
    get vertexIndices(){
        return this._vertexIndices;
    }
    get normals(){
        return this._normals;
    }
    constructor(gl: WebGL2RenderingContext, mesh: SceneFormat.Mesh){
        this._gl = gl;
        this._vertices = new Float32Array(mesh.vertices);
        this._normals = new Float32Array(mesh.normals);
        this._vertexIndices = new Uint32Array(mesh.vertexIndices);
        this._vertexVBO = WebglHelper.createVertexBuffer(gl, this._vertices);
        this._normalVBO = WebglHelper.createVertexBuffer(gl, this._normals);
        this._indexVBO = WebglHelper.createIndexBuffer(gl, this._vertexIndices);
    }
    bindVertexVBO(){
        const gl = this._gl;
        WebglHelper.bindVertexBuffer(gl, this._vertexVBO);
    }
    bindIndexVBO(){
        const gl = this._gl;
        WebglHelper.bindIndexBuffer(gl, this._indexVBO);
    }
    bindNormalVBO(){
        const gl = this._gl;
        WebglHelper.bindVertexBuffer(gl, this._normalVBO);
    }
    dispose(){
        const gl = this._gl;
        WebglHelper.deleteVertexBuffer(gl, this._vertexVBO);
        WebglHelper.deleteVertexBuffer(gl, this._indexVBO);
        WebglHelper.deleteVertexBuffer(gl, this._normalVBO);
    }
}