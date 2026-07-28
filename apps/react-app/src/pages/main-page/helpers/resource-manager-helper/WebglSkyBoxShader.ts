import { WebglHelper } from "./WebglHelper";
import skyboxVShaderSource from "../shaders/skybox-shader/vshader.glsl?raw";
import skyboxFShaderSource from "../shaders/skybox-shader/fshader.glsl?raw";
import { getCubeMeshData } from "../scene-manager-helper/mesh-datas";
import { SkyBoxInfo } from "../asset-cache/SkyBoxInfo";
import { AssetCache } from "../asset-cache/asset-cache";
import { Mat3, Mat4 } from "@shot-engine/types";

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
    render(viewMat4: Mat4, clipMat4: Mat4){
        const uniqueSkyBox = SkyBoxInfo.getInstance().uniqueSkyBox;
        if(!uniqueSkyBox || !uniqueSkyBox.hdrRef) return;
        const webglTextureCube = AssetCache.getInstance().getHdr(uniqueSkyBox.hdrRef)?.enviromentMap;
        if(!webglTextureCube) return;

        const upperLeftMat3 = Mat3.FromMat4(viewMat4);
        viewMat4 = Mat4.FromArray([
            upperLeftMat3.values[0], upperLeftMat3.values[1], upperLeftMat3.values[2], 0,
            upperLeftMat3.values[3], upperLeftMat3.values[4], upperLeftMat3.values[5], 0,
            upperLeftMat3.values[6], upperLeftMat3.values[7], upperLeftMat3.values[8], 0,
            0, 0, 0, 1,
        ]);

        const gl = this._gl;
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_ViewMatrixLoc, false, viewMat4.values);
        gl.uniformMatrix4fv(this._u_ClipMatrixLoc, false, clipMat4.values);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTextureCube.webglTexture);
        gl.uniform1i(this._u_skyboxSamplerLoc, 0);
        gl.bindVertexArray(this._vao);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.depthFunc(gl.LESS);
    }
}