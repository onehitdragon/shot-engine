import z from "zod";

const WrapMode = z.enum(["REPEAT", "MIRROR", "CLAMP"]);
const FilterMode = z.enum(["NONE", "BILINEAR", "TRILINEAR"]);
const ImportBaseSchema = z.object({
    id: z.string(),
});
const ImageBaseSchema = ImportBaseSchema.extend({
    type: z.literal("Image"),
});
const TextureBaseSchema = ImageBaseSchema.extend({
    generateMipmaps: z.boolean(),
    wrapMode: WrapMode,
    filterMode: FilterMode,
});
export const TextureSchema = TextureBaseSchema.extend({
    imageType: z.literal("Texture"),
    sRGB: z.boolean(),
    qualityLevel: z.number()
});
export const NormalMapSchema = TextureBaseSchema.extend({
    imageType: z.literal("NormalMap"),
});
export const LightMapSchema = TextureBaseSchema.extend({
    imageType: z.literal("LightMap"),
});
export const ImageSchema = z.discriminatedUnion("imageType", [
    TextureSchema,
    NormalMapSchema,
    LightMapSchema,
]);
const SoundBaseSchema = ImportBaseSchema.extend({
    type: z.literal("Sound"),
});
export const Mp3Schema = SoundBaseSchema.extend({
    soundType: z.literal("Mp3")
});
export const AccSchema = SoundBaseSchema.extend({
    soundType: z.literal("Acc")
});
export const SoundSchema = z.discriminatedUnion("soundType", [
    Mp3Schema,
    AccSchema
]);
export namespace Imports{
    export type Image = z.infer<typeof ImageSchema>;
    export type Texture = z.infer<typeof TextureSchema>;
    export type NormalMap = z.infer<typeof NormalMapSchema>;
    export type LightMap = z.infer<typeof LightMapSchema>;
    export type Sound = z.infer<typeof SoundSchema>;
    export type Mp3 = z.infer<typeof Mp3Schema>;
    export type Acc = z.infer<typeof AccSchema>;
    export type Import = Image | Sound;
}
