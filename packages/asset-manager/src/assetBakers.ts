import { FontAsset, FontAssetBakeSetting } from "@shot-engine/types";
import generateBMFont from 'msdf-bmfont-xml';
import { imageToRaw } from "./imageToRaw";

function disableConsole(){
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  return () => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }
}
export async function bakeFontAsset(fontPath: string, fontAssetBakeSetting: FontAssetBakeSetting){
  const { fieldType, fontSize, textureWidth, textureHeight } = fontAssetBakeSetting;

  const atlasPngs: Uint8Array[] = [];
  let fontInfo: FontAsset["fontInfo"] | null = null;

  const enableConsole = disableConsole();
  await new Promise<void>((resolve, reject) => {
    generateBMFont(
      fontPath,
      {
        fieldType: fieldType === 0 ? "sdf" : "msdf",
        fontSize: fontSize,
        textureSize: [textureWidth, textureHeight],
        outputType: "json"
      },
      (error, textures, font) => {
        if(error) return reject(error);
        textures.forEach((texture) => {
          atlasPngs.push(new Uint8Array(texture.texture.buffer)); // pass array buffer to avoid copy
        });
        fontInfo = JSON.parse(font.data);
        resolve();
      }
    );
  })
  .finally(() => {
    enableConsole();
  });

  const atlasTextures: FontAsset["atlasTextures"] = [];
  for(const atlasPng of atlasPngs){
    const raw = await imageToRaw(atlasPng);
    atlasTextures.push(new Uint8Array(raw.data.buffer));
  }
  if(!fontInfo) throw "bad fontInfo";
  const fontAsset: FontAsset = {
    bakeSetting: fontAssetBakeSetting,
    atlasTextures,
    fontInfo
  }
  return fontAsset;
}