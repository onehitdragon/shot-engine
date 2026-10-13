import { WebglHelper } from "./WebglHelper";
import uiShadingVShaderSource from "../shaders/ui-text-shader/vshader.glsl?raw";
import uiShadingFShaderSource from "../shaders/ui-text-shader/fshader.glsl?raw";
import { Mat3 } from "@shot-engine/math";
import { AssetCache } from "../asset-cache/asset-cache";

export class WebglUITextShader{
  private static _instance: WebglUITextShader;
  static getInstance(gl: WebGL2RenderingContext){
    if(!this._instance) this._instance = new WebglUITextShader(gl);
    return this._instance;
  }
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _vao: WebGLVertexArrayObject;

  private _a_PositionLoc: number;
  private _a_uvLoc: number;
  private _a_colorLoc: number;
  private _a_pageLoc: number;
  private _u_projectMatrixLoc: WebGLUniformLocation;
  private _u_texturesLoc: WebGLUniformLocation;

  private _vertexBuffer: WebGLBuffer; // fixed size
  private _indexBuffer: WebGLBuffer; // fixed size

  private constructor(gl: WebGL2RenderingContext){
    this._gl = gl;
    this._program = WebglHelper.createProgram(
      gl,
      [
        { type: gl.VERTEX_SHADER, source: uiShadingVShaderSource },
        { type: gl.FRAGMENT_SHADER, source: uiShadingFShaderSource },
      ]
    );

    const textCount = 500;
    this._vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    // 4 vertices * 9 float(xyz,uv,rgb,page) * 4bytes
    gl.bufferData(gl.ARRAY_BUFFER, textCount * 4 * 9 * 4, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    const indices = new Uint32Array(textCount * 6);
    for(let i = 0; i < textCount; i++){
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
    this._a_uvLoc = WebglHelper.getAttrLocation(gl, this._program, "a_uv");
    this._a_colorLoc = WebglHelper.getAttrLocation(gl, this._program, "a_color");
    this._a_pageLoc = WebglHelper.getAttrLocation(gl, this._program, "a_page");
    this._u_projectMatrixLoc = WebglHelper.getUniformLocation(gl, this._program, "u_projectMatrix");
    this._u_texturesLoc = WebglHelper.getUniformLocation(gl, this._program, "u_textures");
    this._vao = this.initVAO();
  }
  private initVAO(){
    const gl = this._gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
      const stride = 9 * 4;
      WebglHelper.bindVertexBuffer(gl, this._vertexBuffer);
      gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(this._a_uvLoc, 2, gl.FLOAT, false, stride, 3 * 4);
      gl.vertexAttribPointer(this._a_colorLoc, 3, gl.FLOAT, false, stride, 5 * 4);
      gl.vertexAttribPointer(this._a_pageLoc, 1, gl.FLOAT, false, stride, 8 * 4);
      gl.enableVertexAttribArray(this._a_PositionLoc);
      gl.enableVertexAttribArray(this._a_uvLoc);
      gl.enableVertexAttribArray(this._a_colorLoc);
      gl.enableVertexAttribArray(this._a_pageLoc);
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
  render(
    projectMat3: Mat3, vertices: Float32Array, textCount: number,
    fontRef: string
  ){
    this.updateVertexBuffer(vertices);

    const gl = this._gl;
    gl.useProgram(this._program);
    gl.uniformMatrix3fv(this._u_projectMatrixLoc, false, projectMat3.values);
    gl.uniform1iv(this._u_texturesLoc, [0, 1, 2, 3]);

    const webglTextureAtlas = AssetCache.getInstance().getWebglTextureAtlas(fontRef);
    if(!webglTextureAtlas){
      console.warn("cant find webglTextureAtlas");
      return;
    }
    if(webglTextureAtlas.webglTextures.length > 4){
      console.warn("too many webglTextureAtlas");
      return;
    }
    for(let i = 0; i < webglTextureAtlas.webglTextures.length; i++){
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, webglTextureAtlas.webglTextures[i]);
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this._vao);
      gl.drawElements(gl.TRIANGLES, textCount * 6, gl.UNSIGNED_INT, 0); // 6 point
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }
}