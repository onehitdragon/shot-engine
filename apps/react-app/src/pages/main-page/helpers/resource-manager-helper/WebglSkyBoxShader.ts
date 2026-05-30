import { WebglHelper } from "./WebglHelper";
import skyboxVShaderSource from "../shaders/skybox-shader/vshader.glsl?raw";
import skyboxFShaderSource from "../shaders/skybox-shader/fshader.glsl?raw";
import { getCubeMeshData } from "../scene-manager-helper/mesh-datas";
import { mat3, mat4 } from "gl-matrix";
import { SkyBoxInfo } from "../asset-cache/SkyBoxInfo";
import { AssetCache } from "../asset-cache/asset-cache";

export class WebglSkyBoxShader{
    private static _instance: WebglSkyBoxShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglSkyBoxShader(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _a_PositionLoc: number;
    private _u_ViewMatrixLoc: WebGLUniformLocation;
    private _u_ClipMatrixLoc: WebGLUniformLocation;
    private _u_skyboxSamplerLoc: WebGLUniformLocation;
    private _vao: WebGLVertexArrayObject;

    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._program = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: skyboxVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: skyboxFShaderSource },
            ]
        );
        this._a_PositionLoc = WebglHelper.getAttrLocation(gl, this._program, "a_Position");
        this._u_ViewMatrixLoc = WebglHelper.getUniformLocation(gl, this._program, "u_ViewMatrix");
        this._u_ClipMatrixLoc = WebglHelper.getUniformLocation(gl, this._program, "u_ClipMatrix");
        this._u_skyboxSamplerLoc = WebglHelper.getUniformLocation(gl, this._program, "u_skyboxSampler");
        this._vao = this.initVAO();
    }
    private initVAO(){
        const gl = this._gl;
        const cubeMeshData = getCubeMeshData();
        const vao = gl.createVertexArray();
        const vertexVBO = WebglHelper.createVertexBuffer(gl, cubeMeshData.vertices);
        const indexVBO = WebglHelper.createIndexBuffer(gl, cubeMeshData.vertexIndices);
        gl.bindVertexArray(vao);
            WebglHelper.bindVertexBuffer(gl, vertexVBO);
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            WebglHelper.bindIndexBuffer(gl, indexVBO);
        gl.bindVertexArray(null);
        return vao;
    }
    render(viewMat4: mat4, clipMat4: mat4){
        const uniqueSkyBox = SkyBoxInfo.getInstance().uniqueSkyBox;
        if(!uniqueSkyBox || !uniqueSkyBox.hdrRef) return;
        const webglTextureCube = AssetCache.getInstance().getWebglTextureCube(uniqueSkyBox.hdrRef);
        if(!webglTextureCube) return;

        const upperLeftMat3 = mat3.create();
        mat3.fromMat4(upperLeftMat3, viewMat4);
        viewMat4 = mat4.fromValues(
            upperLeftMat3[0], upperLeftMat3[1], upperLeftMat3[2], 0,
            upperLeftMat3[3], upperLeftMat3[4], upperLeftMat3[5], 0,
            upperLeftMat3[6], upperLeftMat3[7], upperLeftMat3[8], 0,
            0, 0, 0, 1,
        );

        const gl = this._gl;
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_ViewMatrixLoc, false, viewMat4);
        gl.uniformMatrix4fv(this._u_ClipMatrixLoc, false, clipMat4);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTextureCube.webglTexture);
        gl.uniform1i(this._u_skyboxSamplerLoc, 0);
        gl.bindVertexArray(this._vao);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.depthFunc(gl.LESS);
    }
}