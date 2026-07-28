import { WebglHelper } from "./WebglHelper";
import simpleShadingVShaderSource from "../shaders/simple-shader/vshader.glsl?raw";
import simpleShadingFShaderSource from "../shaders/simple-shader/fshader.glsl?raw";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import type { Mat4, Vec3 } from "@shot-engine/types";

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
    private _u_color: WebGLUniformLocation;
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
        this._u_color = WebglHelper.getUniformLocation(gl, this._program, "u_color");
    }
    createMeshVAOs(meshVBOs: WebglMeshVBOs){
        const gl = this._gl;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = (3 + 3 + 2) * 4; // (3 verter, 3 normal, 2 uv) * floatSize = 4
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    renderMesh(meshVBOs: WebglMeshVBOs, vao: WebGLVertexArrayObject, mvpMat4: Mat4, color?: Vec3){
        const gl = this._gl;
        const vbos = meshVBOs;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_MvpMatrixLoc, false, mvpMat4.values);
        if(!color) color = { x: 1, y: 1, z: 1 };
        gl.uniform3fv(this._u_color, [color.x, color.y, color.z]);

        gl.bindVertexArray(vao);
            gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
        gl.bindVertexArray(null);
    }
}