import { WebglHelper } from "./WebglHelper";
import simpleShadingVShaderSource from "../shaders/simple-shader/vshader.glsl?raw";
import simpleShadingFShaderSource from "../shaders/simple-shader/fshader.glsl?raw";
import simpleSkinShadingVShaderSource from "../shaders/simple-shader/vshader-skin.glsl?raw";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import type { Mat4, Vec3 } from "@shot-engine/types";

export class WebglSimpleShader{
    private static _instance: WebglSimpleShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglSimpleShader(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _staticProgram: {
        program: WebGLProgram,
        u_MvpMatrixLoc: WebGLUniformLocation,
        a_PositionLoc: number,
        u_color: WebGLUniformLocation,
    };
    private _skinProgram: {
        program: WebGLProgram,
        u_vpMatrixLoc: WebGLUniformLocation,
        u_invBindPoseMatrixLoc: WebGLUniformLocation
        u_jointMatrixLoc: WebGLUniformLocation,
        a_PositionLoc: number,
        a_WeightLoc: number,
        a_JointLoc: number,
        u_color: WebGLUniformLocation,
    };
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        const staticProgram = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: simpleShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: simpleShadingFShaderSource },
            ]
        );
        this._staticProgram = {
            program: staticProgram,
            u_MvpMatrixLoc: WebglHelper.getUniformLocation(gl, staticProgram, "u_MvpMatrix"),
            a_PositionLoc: WebglHelper.getAttrLocation(gl, staticProgram, "a_Position"),
            u_color: WebglHelper.getUniformLocation(gl, staticProgram, "u_color")
        }

        const skinProgram = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: simpleSkinShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: simpleShadingFShaderSource },
            ]
        );
        this._skinProgram = {
            program: skinProgram,
            u_vpMatrixLoc: WebglHelper.getUniformLocation(gl, skinProgram, "u_vpMatrix"),
            u_invBindPoseMatrixLoc: WebglHelper.getUniformLocation(
                gl, skinProgram, "u_invBindPoseMatrix[0]"
            ),
            u_jointMatrixLoc: WebglHelper.getUniformLocation(
                gl, skinProgram, "u_jointMatrix[0]"
            ),
            a_PositionLoc: WebglHelper.getAttrLocation(gl, skinProgram, "a_Position"),
            a_WeightLoc: WebglHelper.getAttrLocation(gl, skinProgram, "a_Weight"),
            a_JointLoc: WebglHelper.getAttrLocation(gl, skinProgram, "a_Joint"),
            u_color: WebglHelper.getUniformLocation(gl, skinProgram, "u_color"),
        }
    }
    createStaticMeshVAOs(meshVBOs: WebglMeshVBOs){
        const gl = this._gl;
        const { a_PositionLoc } = this._staticProgram;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = (3 + 3 + 2 + 3) * 4; // (3 verter, 3 normal, 2 uv, 3 tangent) * floatSize = 4
            gl.vertexAttribPointer(a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(a_PositionLoc);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    createSkinMeshVAOs(meshVBOs: WebglMeshVBOs, invBindPoseMatrices: Float32Array){
        const gl = this._gl;
        const { program, u_invBindPoseMatrixLoc, a_PositionLoc, a_WeightLoc, a_JointLoc } = this._skinProgram;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = 64; // (pos, normal, uv, tangent)44bytes (weight)16bytes (joint)4bytes
            gl.vertexAttribPointer(a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(a_PositionLoc);
            gl.vertexAttribPointer(a_WeightLoc, 4, gl.FLOAT, false, stride, 44);
            gl.enableVertexAttribArray(a_WeightLoc);
            gl.vertexAttribIPointer(a_JointLoc, 4, gl.UNSIGNED_BYTE, stride, 60);
            gl.enableVertexAttribArray(a_JointLoc);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);

        gl.useProgram(program);
        gl.uniformMatrix4fv(u_invBindPoseMatrixLoc, false, invBindPoseMatrices);
        gl.useProgram(null);

        return vao;
    }
    renderStaticMesh(meshVBOs: WebglMeshVBOs, vao: WebGLVertexArrayObject, mvpMat4: Mat4, color?: Vec3){
        const gl = this._gl;
        const { program, u_MvpMatrixLoc, u_color } = this._staticProgram;
        const vbos = meshVBOs;
        gl.useProgram(program);
        gl.uniformMatrix4fv(u_MvpMatrixLoc, false, mvpMat4.values);
        if(!color) color = { x: 1, y: 1, z: 1 };
        gl.uniform3fv(u_color, [color.x, color.y, color.z]);

        gl.bindVertexArray(vao);
            gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
        gl.bindVertexArray(null);
    }
    renderSkinMesh(
        meshVBOs: WebglMeshVBOs,
        vao: WebGLVertexArrayObject,
        vpMat4: Mat4,
        jointMatrices: Float32Array,
        color?: Vec3
    ){
        const gl = this._gl;
        const { program, u_vpMatrixLoc, u_jointMatrixLoc, u_color } = this._skinProgram;
        const vbos = meshVBOs;
        gl.useProgram(program);
        gl.uniformMatrix4fv(u_vpMatrixLoc, false, vpMat4.values);
        gl.uniformMatrix4fv(u_jointMatrixLoc, false, jointMatrices);
        if(!color) color = { x: 1, y: 1, z: 1 };
        gl.uniform3fv(u_color, [color.x, color.y, color.z]);

        gl.bindVertexArray(vao);
            gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
        gl.bindVertexArray(null);
    }
}