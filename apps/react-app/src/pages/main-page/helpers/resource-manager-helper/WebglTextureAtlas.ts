import type { FontAsset } from "@shot-engine/types";

export class WebglTextureAtlas{
  private _gl: WebGL2RenderingContext;
  private _webglTextures: WebGLTexture[];
  get webglTextures(){
    return this._webglTextures;
  }
  constructor(gl: WebGL2RenderingContext, fontAsset: FontAsset){
    this._gl = gl;
    this._webglTextures = [];
    const { textureWidth, textureHeight, fieldType } = fontAsset.bakeSetting;
    const { atlasTextures } = fontAsset;
    for(const atlasTexture of atlasTextures){
      const webglTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, webglTexture);
      // 0 "sdf" 1 "msdf"
      if(fieldType === 0){
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA8, textureWidth, textureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlasTexture
        );
      }
      else{
        // todo
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
      this._webglTextures.push(webglTexture);
    }
  }
  public dispose(){
    const gl = this._gl;
    for(const webglTexture of this._webglTextures){
      gl.deleteTexture(webglTexture);
    }
  }
}