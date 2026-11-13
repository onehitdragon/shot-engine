import { GameObject, Scene, AABB } from "./engine.js"
import { Vec3, Vec4 } from "@shot-engine/math";

export type OtherAsset = {
    content: string
}
export type ImageAsset = {
    origin: Uint8Array, // for icon, for glb
    ktx2: Uint8Array,
    hasAlpha: boolean, // for transcoder
}
export type GLTypeAndNormalized = {
    type: number, // WebGL enum value
    normalized: boolean,
    itemSize: number, // in byte
    count: number,
}
export type MeshAsset = {
    primitives: {
        attribute: {
            // vertex(3) 12 bytes, normal(3) 12 bytes, uv(2) 8 bytes, tangent(4) 16 bytes
            // joint(4 uint) 4 bytes, weight(4) 16 bytes,
            interleaveArray: Uint8Array, // raw buffer
            position: GLTypeAndNormalized,
            normal: GLTypeAndNormalized,
            uv: GLTypeAndNormalized,
            tangent: GLTypeAndNormalized,
            joint: GLTypeAndNormalized,
            weight: GLTypeAndNormalized,
        },
        indices: Uint8Array, // raw buffer
        indexType: number, // WebGL enum value
        indexCount: number,
        drawMode: number, // WebGL enum value
        aabb: AABB
    }[],
    invBindPoseMatrices: Float32Array // only valid for skined mesh
}
export class MeshAssetHelper{
    public static getIndicesTypedArray(indices: Uint8Array, indexType: number){
        if(indexType === 5121){
            return indices;
        }
        else if(indexType === 5123){
            return new Uint16Array(indices.buffer);
        }
        else if(indexType === 5125){
            return new Uint32Array(indices.buffer);
        }
        return indices;
    }
}
export type BaseMaterialAsset = {
    culling: "none" | "back" | "front",
    transparent: "opaque" | "mask" | "blend",
    alphaCutoff: number // valid for transparent mode is mask
}
export type SimpleMaterialAsset = BaseMaterialAsset & {
    matType: "simple",
    color: Vec4,
}
export type PbrMaterialAsset = BaseMaterialAsset & {
    matType: "pbr",
    baseFactor: Vec4,
    baseTextureRef?: string,
    metallicFactor: number, // 0 -> 1
    roughnessFactor: number, // 0 -> 1
    metallicRoughnessTextureRef?: string, // g-roughness b-metalness
    normalScale: number, // any value
    normalTextureRef?: string,
    emissitveFactor: Vec3,
    emissiveTextureRef?: string,
    occlusionStrength: number, // 0 -> 1
    occlusionTextureRef?: string,
}
export type MaterialAsset = SimpleMaterialAsset | PbrMaterialAsset;
export type PrefabAsset = {
    root: GameObject
}
export type SceneAsset = {
    scene: Scene
}
export type HdrImage = { width: number, height: number, data: Float32Array };
export type HdrCube = {
    right: HdrImage,
    left: HdrImage,
    top: HdrImage,
    bottom: HdrImage,
    font: HdrImage,
    back: HdrImage,
}
export type HdrAsset = {
    enviromentMap: HdrCube,
    irradianceMap: HdrCube,
    prefilterMap: {
        mipMapCount: number,
        mipMaps: HdrCube[]
    },
    brdfLUT: HdrImage
}
export type SceneSetting = {
    mainRef?: string,
    importRefs: string[]
}
export type ProjectSettingAsset = {
    scene: SceneSetting
}
export type FontAssetBakeSetting = {
    fieldType: number, // 0 "sdf" 1 "msdf",
    fontSize: number,
    textureWidth: number,
    textureHeight: number,
}
export type FontAsset = {
    bakeSetting: FontAssetBakeSetting
    atlasTextures: Uint8Array[]
    fontInfo: {
        chars: {
            id: number,
            char: string,
            xoffset: number,
            yoffset: number,
            width: number,
            height: number,
            xadvance: number,
            x: number,
            y: number,
            page: number
        }[],
        common: {
            lineHeight: number
        }
    }
}
export type TextAsset = {
    text: string
}
export type Asset = OtherAsset | ImageAsset | MaterialAsset | MeshAsset | PrefabAsset |
    SceneAsset | HdrAsset | ProjectSettingAsset | FontAsset | TextAsset;
export function isPrefabAsset(asset?: Asset | null): asset is PrefabAsset{
    if(!asset) return false;
    return "root" in asset;
}

export type AssetType = "other" | "image" | "material" | "mesh" | "prefab" | "scene" |
    "hdr" | "setting" | "font" | "text";
export function assetTypeToNum(type: AssetType): number{
    enum AssetTypeEnum{
        other, image, mesh, prefab, scene, hdr, setting, font, text
    }
    if(type === "other") return AssetTypeEnum.other;
    if(type === "image") return AssetTypeEnum.image;
    if(type === "mesh") return AssetTypeEnum.mesh;
    if(type === "prefab") return AssetTypeEnum.prefab;
    if(type === "scene") return AssetTypeEnum.scene;
    if(type === "hdr") return AssetTypeEnum.hdr;
    if(type === "setting") return AssetTypeEnum.setting;
    if(type === "font") return AssetTypeEnum.font;
    if(type === "text") return AssetTypeEnum.text;
    throw "dont support type " + type;
}
export namespace AssetProperty{
    export type Other = {
        type: "other"
    }

    export type Image = {
        type: "image",
        imageType: "Texture" | "NormalMap"
        sRGB: boolean,
        flipY: boolean,
        generateMipmaps: boolean,
        wrapModeS: "REPEAT" | "MIRROR" | "CLAMP",
        wrapModeT: "REPEAT" | "MIRROR" | "CLAMP",
        filterMode: "NONE" | "LINEAR",
    }

    export type Mesh = {
        type: "mesh"
    }

    export type Material = {
        type: "material"
    }

    export type Prefab = {
        type: "prefab"
    }

    export type Scene = {
        type: "scene"
    }

    export type Hdr = {
        type: "hdr"
    }

    export type Setting = {
        type: "setting"
    }

    export type Font = {
        type: "font"
    }

    export type Text = {
        type: "text"
    }

    export type AssetProperty = Other | Image | Mesh | Material
        | Prefab | Scene | Hdr | Setting | Font | Text;
}
