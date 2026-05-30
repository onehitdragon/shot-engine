export class WebglTextureCube{
    private _gl: WebGL2RenderingContext;
    private _webglTexture: WebGLTexture;
    get webglTexture(){
        return this._webglTexture;
    }
    constructor(
        gl: WebGL2RenderingContext,
        faces: { width: number, height: number, data: Float32Array }[]
    ){
        this._gl = gl;
        const webglTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);
        for(let i = 0; i < 6; i++){
            const face = faces[i];
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                gl.RGBA32F,
                face.width,
                face.height,
                0,
                gl.RGBA,
                gl.FLOAT,
                face.data
            );
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        this._webglTexture = webglTexture;
    }
    public dispose(){
        const gl = this._gl;
        gl.deleteTexture(this._webglTexture);
    }
}