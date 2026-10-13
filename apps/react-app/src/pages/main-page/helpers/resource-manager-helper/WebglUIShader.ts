import { WebglHelper } from "./WebglHelper";
import uiShadingVShaderSource from "../shaders/ui-shader/vshader.glsl?raw";
import uiShadingFShaderSource from "../shaders/ui-shader/fshader.glsl?raw";
import { Mat3 } from "@shot-engine/math";

export class WebglUIShader{
  private static _instance: WebglUIShader;
  static getInstance(gl: WebGL2RenderingContext){
    if(!this._instance) this._instance = new WebglUIShader(gl);
    return this._instance;
  }
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _vao: WebGLVertexArrayObject;
  private _a_PositionLoc: number;
  private _a_bgColorLoc: number;
  private _u_projectMatrixLoc: WebGLUniformLocation;
  private _vertexBuffer: WebGLBuffer;
  private _indexBuffer: WebGLBuffer;

  private constructor(gl: WebGL2RenderingContext){
    this._gl = gl;
    this._program = WebglHelper.createProgram(
      gl,
      [
        { type: gl.VERTEX_SHADER, source: uiShadingVShaderSource },
        { type: gl.FRAGMENT_SHADER, source: uiShadingFShaderSource },
      ]
    );

    const quadCount = 500;
    this._vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    // 4 vertices * 6 float(xyz,rgb) * 4bytes
    gl.bufferData(gl.ARRAY_BUFFER, quadCount * 4 * 6 * 4, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    const indices = new Uint32Array(quadCount * 6);
    for(let i = 0; i < quadCount; i++){
      indices[i * 6 + 0] = i * 4;
      indices[i * 6 + 1] = i * 4 + 1;
      indices[i * 6 + 2] = i * 4 + 2;
      indices[i * 6 + 3] = i * 4;
      indices[i * 6 + 4] = i * 4 + 2;
      indices[i * 6 + 5] = i * 4 + 3;
    }
    this._indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this._a_PositionLoc = WebglHelper.getAttrLocation(gl, this._program, "a_Position");
    this._a_bgColorLoc = WebglHelper.getAttrLocation(gl, this._program, "a_bgColor");
    this._u_projectMatrixLoc = WebglHelper.getUniformLocation(gl, this._program, "u_projectMatrix");
    this._vao = this.initVAO();
  }
  private initVAO(){
    const gl = this._gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
        WebglHelper.bindVertexBuffer(gl, this._vertexBuffer);
        gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, 6 * 4, 0);
        gl.vertexAttribPointer(this._a_bgColorLoc, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
        gl.enableVertexAttribArray(this._a_PositionLoc);
        gl.enableVertexAttribArray(this._a_bgColorLoc);
        WebglHelper.bindIndexBuffer(gl, this._indexBuffer);
    gl.bindVertexArray(null);
    return vao;
  }
  private updateVertexBuffer(vertices: Float32Array){
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  render(projectMat3: Mat3, vertices: Float32Array, quadCount: number){
    this.updateVertexBuffer(vertices);

    const gl = this._gl;
    gl.useProgram(this._program);
    gl.uniformMatrix3fv(this._u_projectMatrixLoc, false, projectMat3.values);
    gl.disable(gl.DEPTH_TEST);
    gl.bindVertexArray(this._vao);
        gl.drawElements(gl.TRIANGLES, quadCount * 6, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }
}