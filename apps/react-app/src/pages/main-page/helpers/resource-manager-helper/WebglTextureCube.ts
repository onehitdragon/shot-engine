export class WebglTextureCube{
    private _gl: WebGL2RenderingContext;
    private _webglTexture: WebGLTexture;
    get webglTexture(){
        return this._webglTexture;
    }
    constructor(
        gl: WebGL2RenderingContext,
        mipMaps: {
            level: number,
            faces: { width: number, height: number, data: Float32Array }[]
        }[],
        filter?: {
            MIN?: number,
            MAG?: number
        }
    ){
        this._gl = gl;
        const webglTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);
        for(const mipMap of mipMaps){
            for(let i = 0; i < 6; i++){
                const face = mipMap.faces[i];
                gl.texImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    mipMap.level,
                    gl.RGBA32F,
                    face.width,
                    face.height,
                    0,
                    gl.RGBA,
                    gl.FLOAT,
                    face.data
                );
            }
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, filter?.MIN ?? gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, filter?.MAG ?? gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAX_LEVEL, mipMaps.length - 1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        this._webglTexture = webglTexture;
    }
    public dispose(){
        const gl = this._gl;
        gl.deleteTexture(this._webglTexture);
    }
}