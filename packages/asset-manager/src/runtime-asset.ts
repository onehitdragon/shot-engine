import * as ShotEngineType from "@shot-engine/types";
import { query } from "./assetManager.js";
import { readImageAsset } from "./flatbf.js";

// export type RTImageAsset = {
//   compressedData: Uint8Array,
//   sRGB: boolean,
//   wrapMode: number, // 0-repeat 1-mirror 2-clamp
//   filterMode: number, // 0-nearest 1-linear
// }
// export function CreateRTImageAsset(imageAssetUuid: string, imageAssetPath: string) {
//   const imageAssetInfo = query().getAssetInfoFromUuid(imageAssetUuid);
//   if (!imageAssetInfo) throw "error while get imageAssetInfo";
//   const imageAsset = readImageAsset(imageAssetPath);
  

//   const property = JSON.parse(imageAssetInfo.property) as ShotEngineType.AssetProperty.Image;
//   let wrapModeNum = 0;
//   if (property.wrapMode === "MIRROR") wrapModeNum = 1;
//   if (property.wrapMode === "CLAMP") wrapModeNum = 2;
//   let filterModeNum = 0;
//   if (property.filterMode === "BILINEAR" || property.filterMode === "TRILINEAR") filterModeNum = 1;
//   const rtImageAsset: RTImageAsset = {
//     compressedData: ,
//     sRGB: property.imageType === "Texture" ? property.sRGB : false,
//     wrapMode: wrapModeNum,
//     filterMode: filterModeNum,
//   };
//   return rtImageAsset;
// }
