import { KTXEncoder } from "@shot-engine/ktx-tool/encoder";
import { AssetProperty, ImageAsset } from "@shot-engine/types";
import sharp from "sharp";

export async function createKTXImageAsset(
  imagePath: string | Uint8Array, property: AssetProperty.Image
){
  const imageAsset: ImageAsset = {
    ktx2: new Uint8Array(),
    ktx2NoFlip: new Uint8Array(),
    hasAlpha: false,
    alphaType: "cutoff"
  }

  // decode image
  const imageSharp = sharp(imagePath);
  const { width, height } = await imageSharp.metadata();
  const imageRawBuffer = await imageSharp.ensureAlpha().raw().toBuffer(); // ensure rgba all images
  const imageBufferView = new Uint8Array(imageRawBuffer.buffer);

  const { imageType } = property;
  const ktxEncoder = KTXEncoder.getInstance();
  await ktxEncoder.init();
  if(imageType === "Texture"){
    // check alpha
    for(let i = 3; i < imageBufferView.length; i += 4){
      if(imageBufferView[i] < 255) imageAsset.hasAlpha = true;
      if(imageBufferView[i] > 0 && imageBufferView[i] < 255){
        imageAsset.alphaType = "smooth";
        break;
      };
    }
    // encode ktx
    const { sRGB, generateMipmaps } = property;
    // imageAsset.ktx2 = await ktxEncoder.encodeTexture(imageRawBuffer, width, height, sRGB, generateMipmaps, true);
    imageAsset.ktx2NoFlip = await ktxEncoder.encodeTexture(imageRawBuffer, width, height, sRGB, generateMipmaps, false);
  }
  else if(imageType === "NormalMap"){
    // encode ktx
    const { generateMipmaps } = property;
    // imageAsset.ktx2 = await ktxEncoder.encodeNormalMap(imageRawBuffer, width, height, generateMipmaps, true);
    imageAsset.ktx2NoFlip = await ktxEncoder.encodeNormalMap(imageRawBuffer, width, height, generateMipmaps, false);
  }
  else throw "error: genKTX2 imageType dont support";

  return imageAsset;
}