import { WebglHelper } from "./WebglHelper";
import { mat4 } from "gl-matrix";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import { Mat4, type GizmoShading } from "@shot-engine/types";
import shadingVShaderSource from "../shaders/gizmo-shader/vshader.glsl?raw";
import shadingFShaderSource from "../shaders/gizmo-shader/fshader.glsl?raw";

export class WebglGizmoShader{
  private static _instance: WebglGizmoShader;
  static getInstance(gl: WebGL2RenderingContext){
      if(!this._instance) this._instance = new WebglGizmoShader(gl);
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
        { type: gl.VERTEX_SHADER, source: shadingVShaderSource },
        { type: gl.FRAGMENT_SHADER, source: shadingFShaderSource },
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
  renderMesh(
    meshVBOs: WebglMeshVBOs,
    vao: WebGLVertexArrayObject,
    mvpMat4: Mat4,
    shadingComponent: GizmoShading
  ){
    const { color } = shadingComponent;

    const gl = this._gl;
    const vbos = meshVBOs;
    gl.useProgram(this._program);
    gl.uniformMatrix4fv(this._u_MvpMatrixLoc, false, mvpMat4.values);
    gl.uniform3fv(this._u_color, [color.x, color.y, color.z]);

    gl.disable(gl.DEPTH_TEST);
    gl.bindVertexArray(vao);
      gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }
}