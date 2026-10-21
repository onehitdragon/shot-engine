import sharp from "sharp";

/**
 * @param image encoded png, jpg...
 */
export async function imageToRaw(image: Uint8Array){
    // .raw().toBuffer dont decode sRGB
    return await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}