import { AssetProperty } from "@shot-engine/types";

// defaults
export const defaultOtherAsset: AssetProperty.Other = {
    type: "other"
}
export const defaultImageAsset: AssetProperty.Image = {
    type: "image",
    imageType: "Texture",
    sRGB: true,
    generateMipmaps: true,
    wrapMode: "REPEAT",
    filterMode: "BILINEAR"
};
export const defaultMeshAsset: AssetProperty.Mesh = {
    type: "mesh"
};
export const defaultPrefabAsset: AssetProperty.Prefab = {
    type: "prefab"
};
export const defaultSceneAsset: AssetProperty.Scene = {
    type: "scene"
};
export const defaultHdrAsset: AssetProperty.Hdr = {
    type: "hdr"
};
export const defaultFontAsset: AssetProperty.Font = {
    type: "font"
};
export const defaultTextAsset: AssetProperty.Text = {
    type: "text"
};
export const defaultOtherAssetJSON = JSON.stringify(defaultOtherAsset);
export const defaultImageAssetJSON = JSON.stringify(defaultImageAsset);
export const defaultMeshAssetJSON = JSON.stringify(defaultMeshAsset);
export const defaultPrefabAssetJSON = JSON.stringify(defaultPrefabAsset);
export const defaultSceneAssetJSON = JSON.stringify(defaultSceneAsset);
export const defaultHdrAssetJSON = JSON.stringify(defaultHdrAsset);
export const defaultFontAssetJSON = JSON.stringify(defaultFontAsset);
export const defaultTextAssetJSON = JSON.stringify(defaultTextAsset);
