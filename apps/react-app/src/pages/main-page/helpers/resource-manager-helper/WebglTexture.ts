import type { AssetProperty, ImageAsset } from "@shot-engine/types";
import type { Assets } from "../../../../engine-zod";
import { KTXTranscoder } from "@shot-engine/ktx-tool/transcoder";

export class WebglTexture{
    private _gl: WebGL2RenderingContext;
    private _webglTexture: WebGLTexture;
    get webglTexture(){
        return this._webglTexture;
    }
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._webglTexture = gl.createTexture();
    }
    public static async Create(
        gl: WebGL2RenderingContext, imageAsset: ImageAsset, property: AssetProperty.Image
    ){
        const instance = new WebglTexture(gl);
        const webglTexture = instance._webglTexture;

        const { ktx2 } = imageAsset;
        const ktxTranscoder = KTXTranscoder.getInstance();
        await ktxTranscoder.init();
        const bc3RGBAs = await ktxTranscoder.bc3RGBA(ktx2);

        const { imageType, wrapMode, filterMode, generateMipmaps } = property;
        gl.bindTexture(gl.TEXTURE_2D, webglTexture);

        // get format
        const extS3TC = gl.getExtension("WEBGL_compressed_texture_s3tc");
        if(!extS3TC) throw "dont support WEBGL_compressed_texture_s3tc";
        let format: number = extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT; // for normal or texture no sRGB
        if(imageType === "Texture" && property.sRGB){
            const extS3TC_srgb = gl.getExtension("WEBGL_compressed_texture_s3tc_srgb");
            if(!extS3TC_srgb) throw "dont support WEBGL_compressed_texture_s3tc_srgb"
            format = extS3TC_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        }

        // upload to gpu
        for(const { info, bc3RGBA } of bc3RGBAs){
            const { origWidth: width, origHeight: height, levelIndex } = info;
            gl.compressedTexImage2D(
                gl.TEXTURE_2D, levelIndex, format, width, height, 0, bc3RGBA
            );
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, bc3RGBAs.length - 1);
        
        // other
        instance.setWrapMode(wrapMode);
        instance.setFilterMode(generateMipmaps, filterMode);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return instance;
    }
    /**
     * @param colorData RGBA
     */
    public static CreateWithColor(gl: WebGL2RenderingContext, colorData: Uint8Array){
        const instance = new WebglTexture(gl);
        const webglTexture = instance._webglTexture;

        gl.bindTexture(gl.TEXTURE_2D, webglTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, colorData);

        instance.setWrapMode("CLAMP");
        instance.setFilterMode(false, "NONE");
        gl.bindTexture(gl.TEXTURE_2D, null);

        return instance;
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