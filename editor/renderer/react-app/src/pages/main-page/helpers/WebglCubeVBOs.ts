import { cubeMeshData } from "./mesh-datas";
import { WebglHelper } from "./WebglHelper";

export class WebglCubeVBOs{
    private static _instance: WebglCubeVBOs;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglCubeVBOs(gl);
        return this._instance;
    }
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
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._vertices = new Float32Array(cubeMeshData.vertices);
        this._vertexIndices = new Uint32Array(cubeMeshData.vertexIndices)
        this._normals = new Float32Array(cubeMeshData.normals)
        this._vertexVBO = WebglHelper.createVertexBuffer(gl, this._vertices);
        this._indexVBO = WebglHelper.createIndexBuffer(gl, this._vertexIndices);
        this._normalVBO = WebglHelper.createVertexBuffer(gl, this._normals);
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
}