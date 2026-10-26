import { KTXEncoder } from "@shot-engine/ktx-tool/encoder";
import { AssetProperty } from "@shot-engine/types";

export async function genKTX2(imagePath: string | Uint8Array, property: AssetProperty.Image){
  const { imageType } = property;
  const ktxEncoder = KTXEncoder.getInstance();
  await ktxEncoder.init(); 
  let ktx2Out: Uint8Array;
  if(imageType === "Texture"){
    const { sRGB, generateMipmaps } = property;
    ktx2Out = await ktxEncoder.encodeTexture(imagePath, sRGB, generateMipmaps);
  }
  else if(imageType === "NormalMap"){
    const { generateMipmaps } = property;
    ktx2Out = await ktxEncoder.encodeNormalMap(imagePath, generateMipmaps);
  }
  else throw "error: genKTX2 imageType dont support";
  return ktx2Out;
}