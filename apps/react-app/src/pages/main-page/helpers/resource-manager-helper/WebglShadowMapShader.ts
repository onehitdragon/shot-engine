import { WebglHelper } from "./WebglHelper";
import shadowMapVS from "../shaders/shadow-map-shader/shadowMap-vs.glsl?raw";
import shadowMapFS from "../shaders/shadow-map-shader/shadowMap-fs.glsl?raw";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import type { Mat4 } from "@shot-engine/types";

export class WebglShadowMapShader{
    private static _instance: WebglShadowMapShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglShadowMapShader(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _a_PositionLoc: number;
    private _u_lightVPMatrix: WebGLUniformLocation;
    private _u_modelMatrix: WebGLUniformLocation;
    private constructor(gl: WebGL2RenderingContext){
      this._gl = gl;
      this._program = WebglHelper.createProgram(
        gl,
        [
          { type: gl.VERTEX_SHADER, source: shadowMapVS },
          { type: gl.FRAGMENT_SHADER, source: shadowMapFS },
        ]
      );
      this._a_PositionLoc  = WebglHelper.getAttrLocation(gl, this._program, "a_Position");
      this._u_lightVPMatrix = WebglHelper.getUniformLocation(gl, this._program, "u_lightVPMatrix");
      this._u_modelMatrix = WebglHelper.getUniformLocation(gl, this._program, "u_modelMatrix");
    }
    createMeshVAOs(meshVBOs: WebglMeshVBOs){
      const gl = this._gl;
      const vbos = meshVBOs;
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
        vbos.bindVertexVBO();
        const stride = (3 + 3 + 2 + 3) * 4; // (3 verter, 3 normal, 2 uv, 3 tangent) * floatSize = 4
        gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this._a_PositionLoc);
        vbos.bindIndexVBO();
      gl.bindVertexArray(null);
      return vao;
    }
    renderMesh(meshVBOs: WebglMeshVBOs, vao: WebGLVertexArrayObject, lightVPMat4: Mat4, modelMat4: Mat4){
      const gl = this._gl;
      const vbos = meshVBOs;
      gl.useProgram(this._program);
      gl.uniformMatrix4fv(this._u_lightVPMatrix, false, lightVPMat4.values);
      gl.uniformMatrix4fv(this._u_modelMatrix, false, modelMat4.values);

      gl.bindVertexArray(vao);
        gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
      gl.bindVertexArray(null);
    }
}