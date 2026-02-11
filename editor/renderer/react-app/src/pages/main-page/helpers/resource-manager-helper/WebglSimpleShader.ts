import { WebglHelper } from "./WebglHelper";
import simpleShadingVShaderSource from "../shaders/simple-shader/vshader.glsl?raw";
import simpleShadingFShaderSource from "../shaders/simple-shader/fshader.glsl?raw";
import type { mat4 } from "gl-matrix";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";

export class WebglSimpleShader{
    private static _instance: WebglSimpleShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglSimpleShader(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _u_MvpMatrixLoc: WebGLUniformLocation;
    private _a_PositionLoc: number;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._program = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: simpleShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: simpleShadingFShaderSource },
            ]
        );
        this._u_MvpMatrixLoc = WebglHelper.getUniformLocation(gl, this._program, "u_MvpMatrix");
        this._a_PositionLoc  = WebglHelper.getAttrLocation(gl, this._program, "a_Position");
    }
    createMeshVAOs(meshVBOs: WebglMeshVBOs){
        const gl = this._gl;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = (3 + 3) * 4; // (3 verter float, 3 normal float) * floatSize = 4
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    renderMesh(meshVBOs: WebglMeshVBOs, vao: WebGLVertexArrayObject, mvpMat4: mat4){
        const gl = this._gl;
        const vbos = meshVBOs;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_MvpMatrixLoc, false, mvpMat4);
        gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, vbos.indexCount, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
    }
}