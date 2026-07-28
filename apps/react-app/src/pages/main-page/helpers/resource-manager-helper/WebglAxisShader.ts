import { WebglHelper } from "./WebglHelper";
import gridShadingVShaderSource from "../shaders/axis-shader/vshader.glsl?raw";
import gridShadingFShaderSource from "../shaders/axis-shader/fshader.glsl?raw";
import type { Mat4 } from "@shot-engine/types";

export class WebglAxisShader{
  private static _instance: WebglAxisShader;
  static getInstance(gl: WebGL2RenderingContext){
    if(!this._instance) this._instance = new WebglAxisShader(gl);
    return this._instance;
  }
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _u_VpMatrixLoc: WebGLUniformLocation;
  private _a_PositionLoc: number;
  private _a_ColorLoc: number;
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
    this._a_ColorLoc = WebglHelper.getAttrLocation(gl, this._program, "a_Color");
    this._vao = this.initVAO();
  }
  private initVAO(){
    const gl = this._gl;
    const halfWidth = 0.04; 
    const length = 1000;
    const r = [1, 0, 0];
    const b = [0, 0, 1];
    const vertices = new Float32Array([
      -length, 0, -halfWidth,  ...r,
       length, 0, -halfWidth,  ...r,
      -length, 0,  halfWidth,  ...r,
      -length, 0,  halfWidth,  ...r,
       length, 0, -halfWidth,  ...r,
       length, 0,  halfWidth,  ...r,
      -halfWidth, 0, -length,  ...b,
       halfWidth, 0, -length,  ...b,
      -halfWidth, 0,  length,  ...b,
      -halfWidth, 0,  length,  ...b,
       halfWidth, 0, -length,  ...b,
       halfWidth, 0,  length,  ...b,
    ]);
    
    const vertexVBO = WebglHelper.createVertexBuffer(gl, vertices);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
      WebglHelper.bindVertexBuffer(gl, vertexVBO);
      const stride = (3 + 3) * 4; // (3 verter, 3 color) * floatSize = 4
      gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(this._a_PositionLoc);
      gl.vertexAttribPointer(this._a_ColorLoc, 3, gl.FLOAT, false, stride, 3 * 4);
      gl.enableVertexAttribArray(this._a_ColorLoc);
    gl.bindVertexArray(null);
    return vao;
  }
  render(vpMat4: Mat4){
    const gl = this._gl;
    gl.useProgram(this._program);
    gl.uniformMatrix4fv(this._u_VpMatrixLoc, false, vpMat4.values);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(-1.0, -1.0);
    gl.bindVertexArray(this._vao);
      gl.drawArrays(gl.TRIANGLES, 0, 12);
    gl.bindVertexArray(null);
    gl.disable(gl.POLYGON_OFFSET_FILL);
  }
}