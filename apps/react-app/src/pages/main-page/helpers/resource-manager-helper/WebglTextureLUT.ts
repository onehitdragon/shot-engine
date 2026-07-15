import type { HdrAsset } from "@shot-engine/types";

export class WebglTextureLUT{
  private _gl: WebGL2RenderingContext;
  private _webglTexture: WebGLTexture;
  get webglTexture(){
    return this._webglTexture;
  }
  constructor(gl: WebGL2RenderingContext, brdfLUT: HdrAsset["brdfLUT"]){
    this._gl = gl;
    const { width, height, data } = brdfLUT;
    const webglTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, webglTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, width, height, 0, gl.RG, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this._webglTexture = webglTexture;
  }
  public dispose(){
    const gl = this._gl;
    gl.deleteTexture(this._webglTexture);
  }
}