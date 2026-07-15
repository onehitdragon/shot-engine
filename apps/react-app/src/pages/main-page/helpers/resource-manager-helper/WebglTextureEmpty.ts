export class WebglTextureEmpty{
  private _gl: WebGL2RenderingContext;
  private _webglTexture: WebGLTexture;
  get webglTexture(){
    return this._webglTexture;
  }
  constructor(gl: WebGL2RenderingContext){
    this._gl = gl;
    const webglTexture = gl.createTexture();
    this._webglTexture = webglTexture;
  }
  public dispose(){
    const gl = this._gl;
    gl.deleteTexture(this._webglTexture);
  }
}