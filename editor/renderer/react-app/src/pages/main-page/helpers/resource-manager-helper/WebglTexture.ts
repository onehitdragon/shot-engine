import type { Assets } from "../../../../engine-zod";

export class WebglTexture{
    private _gl: WebGL2RenderingContext;
    private _webglTexture: WebGLTexture;
    constructor(gl: WebGL2RenderingContext, imageResource: Resource.ImageBin, image: Assets.Image){
        this._gl = gl;
        const { width, height, data } = imageResource;
        const { imageType, wrapMode, filterMode, generateMipmaps } = image;
        const webglTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webglTexture);
        this.setWrapMode(wrapMode);
        this.setFilterMode(generateMipmaps, filterMode);
        if(imageType === "Texture"){
            const { sRGB } = image;
            const internalformat = sRGB ? gl.SRGB8_ALPHA8 : gl.RGBA8;
            gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
            if(generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
        }
        else if(imageType === "NormalMap"){
            // todo
            // ignore sRGB
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._webglTexture = webglTexture;
    }
    public dispose(){
        const gl = this._gl;
        gl.deleteTexture(this._webglTexture);
    }
    private setWrapMode(wrapMode: Assets.Image["wrapMode"]){
        const gl = this._gl;
        if(wrapMode === "REPEAT"){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
        else if(wrapMode === "CLAMP"){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        else if(wrapMode === "MIRROR"){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        }
        else throw `dont support ${wrapMode}`
    }
    private setFilterMode(generateMipmaps: boolean, filterMode: Assets.Image["filterMode"]){
        const gl = this._gl;
        if(!generateMipmaps){
            if(filterMode === "NONE"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            else if(filterMode === "BILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else if(filterMode === "TRILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else throw `dont support ${filterMode}`
        }
        else{
            if(filterMode === "NONE"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            else if(filterMode === "BILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else if(filterMode === "TRILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else throw `dont support ${filterMode}`
        }
    }
}