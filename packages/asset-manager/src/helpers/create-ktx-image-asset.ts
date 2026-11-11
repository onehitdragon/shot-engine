import { KTXEncoder } from "@shot-engine/ktx-tool/encoder";
import { AssetProperty, ImageAsset } from "@shot-engine/types";
import sharp from "sharp";
import fs from "fs-extra";

export async function createKTXImageAsset(
  imagePath: string | Uint8Array, property: AssetProperty.Image
){
  const imageAsset: ImageAsset = {
    origin: new Uint8Array(),
    ktx2: new Uint8Array(),
    hasAlpha: false,
  }

  if(typeof imagePath === "string"){
    imageAsset.origin = new Uint8Array(await fs.readFile(imagePath));
  }
  else{
    imageAsset.origin = new Uint8Array(imagePath); // copy
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
      if(imageBufferView[i] < 255){
        imageAsset.hasAlpha = true;
        break;
      }
    }
    // encode ktx
    const { flipY, sRGB, generateMipmaps } = property;
    imageAsset.ktx2 = await ktxEncoder.encodeTexture(
      imageRawBuffer, width, height, sRGB, generateMipmaps, flipY
    );
  }
  else if(imageType === "NormalMap"){
    // encode ktx
    const { flipY, generateMipmaps } = property;
    imageAsset.ktx2 = await ktxEncoder.encodeNormalMap(
      imageRawBuffer, width, height, generateMipmaps, flipY
    );
  }
  else throw "error: genKTX2 imageType dont support";

  return imageAsset;
}