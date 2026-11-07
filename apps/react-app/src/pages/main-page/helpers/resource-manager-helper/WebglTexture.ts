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
        const { webglFormat, stringFormat } = WebglTexture.compressedTextureFormat(gl, imageAsset, property);

        const { ktx2, ktx2NoFlip } = imageAsset;
        const ktxTranscoder = KTXTranscoder.getInstance();
        await ktxTranscoder.init();
        const transcodeInfos = await ktxTranscoder.transcode(ktx2NoFlip, stringFormat);
        
        // upload to gpu
        gl.bindTexture(gl.TEXTURE_2D, webglTexture);
        for(const { info, compressed } of transcodeInfos){
            const { origWidth: width, origHeight: height, levelIndex } = info;
            gl.compressedTexImage2D(
                gl.TEXTURE_2D, levelIndex, webglFormat, width, height, 0, compressed
            );
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, transcodeInfos.length - 1);
        
        // other
        const { wrapMode, filterMode, generateMipmaps } = property;
        instance.setWrapMode(wrapMode);
        instance.setFilterMode(generateMipmaps, filterMode);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return instance;
    }
    public static compressedTextureFormat(
        gl: WebGL2RenderingContext, imageAsset: ImageAsset, property: AssetProperty.Image
    ){
        const bc13Ext = gl.getExtension("WEBGL_compressed_texture_s3tc");
        if(!bc13Ext) throw "dont support WEBGL_compressed_texture_s3tc (BC1, BC3)";
        const bc13Ext_srgb = gl.getExtension("WEBGL_compressed_texture_s3tc_srgb");
        if(!bc13Ext_srgb) throw "dont support WEBGL_compressed_texture_s3tc_srgb (BC1 srgb, BC3 srgb)";
        const bc5Ext = gl.getExtension("EXT_texture_compression_rgtc");
        if(!bc5Ext) throw "dont support EXT_texture_compression_rgtc (BC5)";
        const bc7Ext = gl.getExtension("EXT_texture_compression_bptc");
        if(!bc7Ext) throw "dont support EXT_texture_compression_bptc (BC7)";

        const bc1 = bc13Ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
        const bc3a = bc13Ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        const bc1_srgb = bc13Ext_srgb.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        const bc3a_srgb = bc13Ext_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        const bc5rg = bc5Ext.COMPRESSED_RED_GREEN_RGTC2_EXT;
        
        // find format
        const { hasAlpha } = imageAsset;
        const result: {
            webglFormat: number,
            stringFormat: "bc1" | "bc3" | "bc5"
        } = {
            webglFormat: bc1_srgb,
            stringFormat: "bc1"
        };
        if(property.imageType === "Texture"){
            const { sRGB } = property;
            if(!hasAlpha){
                if(!sRGB) result.webglFormat = bc1;
                else result.webglFormat = bc1_srgb;
                result.stringFormat = "bc1"
            }
            else{
                if(!sRGB) result.webglFormat = bc3a;
                else result.webglFormat = bc3a_srgb;
                result.stringFormat = "bc3"
            }
        }
        if(property.imageType === "NormalMap"){
            result.webglFormat = bc5rg;
            result.stringFormat = "bc5";
        }
        return result;
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
            else if(filterMode === "BILINEAR" || filterMode === "TRILINEAR"){
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
            else if(filterMode === "BILINEAR" || filterMode === "TRILINEAR"){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else throw `dont support ${filterMode}`
        }
    }
}