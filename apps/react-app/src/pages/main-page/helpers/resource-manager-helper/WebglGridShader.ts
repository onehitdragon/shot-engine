import { WebglHelper } from "./WebglHelper";
import gridShadingVShaderSource from "../shaders/grid-shader/vshader.glsl?raw";
import gridShadingFShaderSource from "../shaders/grid-shader/fshader.glsl?raw";
import type { mat4 } from "gl-matrix";

export class WebglGridShader{
    private static _instance: WebglGridShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglGridShader(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _u_VpMatrixLoc: WebGLUniformLocation;
    private _a_PositionLoc: number;
    private _vao: WebGLVertexArrayObject;

    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._program = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: gridShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: gridShadingFShaderSource },
            ]
        );
        this._u_VpMatrixLoc = WebglHelper.getUniformLocation(gl, this._program, "u_VpMatrix");
        this._a_PositionLoc = WebglHelper.getAttrLocation(gl, this._program, "a_Position");
        this._vao = this.initVAO();
    }
    private initVAO(){
        const gl = this._gl;
        const vertices = new Float32Array([1, 0, 1,   -1, 0, 1,   -1, 0, -1,   1, 0, -1]);
        const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const vertexVBO = WebglHelper.createVertexBuffer(gl, vertices);
        const indexVBO = WebglHelper.createIndexBuffer(gl, indices);
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            WebglHelper.bindVertexBuffer(gl, vertexVBO);
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            WebglHelper.bindIndexBuffer(gl, indexVBO);
        gl.bindVertexArray(null);
        return vao;
    }
    render(vpMat4: mat4){
        const gl = this._gl;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_VpMatrixLoc, false, vpMat4);
        gl.bindVertexArray(this._vao);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
    }
}