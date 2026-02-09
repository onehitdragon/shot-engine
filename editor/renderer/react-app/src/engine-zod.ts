import z from "zod";
import { v4 as uuidv4 } from 'uuid';

const AssetBaseSchema = z.object({
    guid: z.string()
});
// folder
export const AssetFolderSchema = AssetBaseSchema.extend({
    isFolder: z.literal(true)
});
// file
export const AssetFileSchema = AssetBaseSchema.extend({
    isFolder: z.literal(false)
});
// image
const WrapMode = z.enum(["REPEAT", "MIRROR", "CLAMP"]);
const FilterMode = z.enum(["NONE", "BILINEAR", "TRILINEAR"]);
const TextureBaseSchema = z.object({
    wrapMode: WrapMode,
    filterMode: FilterMode,
    generateMipmaps: z.boolean(),
});
const TextureSchema = TextureBaseSchema.extend({
    imageType: z.literal("Texture"),
    sRGB: z.boolean(),
    qualityLevel: z.number()
});
const NormalMapSchema = TextureBaseSchema.extend({
    imageType: z.literal("NormalMap"),
});
const LightMapSchema = TextureBaseSchema.extend({
    imageType: z.literal("LightMap"),
});
const ImageSchema = z.discriminatedUnion("imageType", [
    TextureSchema,
    NormalMapSchema,
    LightMapSchema,
]);
export const AssetImageSchema = AssetBaseSchema.extend({
    image: ImageSchema
});
// util
export function createAssetFolder(){
    const newMetaObject: Assets.AssetFolder = {
        guid: uuidv4(),
        isFolder: true
    };
    return newMetaObject;
}
export function createTexture(){
    const texture: Assets.Texture = {
        imageType: "Texture",
        sRGB: true,
        qualityLevel: 255,
        generateMipmaps: true,
        wrapMode: "REPEAT",
        filterMode: "BILINEAR",
    }
    return texture;
}
export function createAssetImage(){
    const newMetaObject: Assets.AssetImage = {
        guid: uuidv4(),
        image: createTexture()
    };
    return newMetaObject;
}
export function isAssetFolder(ass: Assets.Asset): ass is Assets.AssetFolder{
    return "isFolder" in ass && ass.isFolder === true;
}
export function isAssetFile(ass: Assets.Asset): ass is Assets.AssetFile{
    return "isFolder" in ass && ass.isFolder === false;
}
export function isAssetImage(ass: Assets.Asset): ass is Assets.AssetImage{
    return "image" in ass;
}
// types
export namespace Assets{
    export type AssetFolder = z.infer<typeof AssetFolderSchema>;

    export type AssetFile = z.infer<typeof AssetFileSchema>;

    export type Image = z.infer<typeof ImageSchema>;
    export type TextureBase = z.infer<typeof TextureBaseSchema>;
    export type Texture = z.infer<typeof TextureSchema>;
    export type NormalMap = z.infer<typeof NormalMapSchema>;
    export type LightMap = z.infer<typeof LightMapSchema>;
    export type AssetImage = z.infer<typeof AssetImageSchema>;

    export type Asset = AssetFolder | AssetFile | AssetImage;
    export  type MetaObject = {
        path: string,
        asset: Asset
    }
}
