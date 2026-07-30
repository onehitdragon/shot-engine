import { GameObject, Scene, AABB } from "./engine.js"

export type OtherAsset = {
    content: string
}
export type ImageAsset = {
    width: number,
    height: number,
    data: Uint8Array
}
export type MeshAsset = {
    primitives: {
        attribute: {
            interleaveArray: Float32Array, // vertex(3), normal(3), uv(2), tangent(3)
        },
        indices: Uint8Array | Uint16Array | Uint32Array,
        indexType: number,
        drawMode: number,
        aabb: AABB
    }[]
}
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
export type Asset = OtherAsset | ImageAsset | MeshAsset | PrefabAsset | SceneAsset | HdrAsset;
export function isPrefabAsset(asset?: Asset | null): asset is PrefabAsset{
    if(!asset) return false;
    return "root" in asset;
}

export type AssetType = "other" | "image" | "mesh" | "prefab" | "scene" | "hdr";
export namespace AssetProperty{
    export type Other = {
        type: "other"
    }

    export type TextureBase = {
        type: "image"
        wrapMode: "REPEAT" | "MIRROR" | "CLAMP",
        filterMode: "NONE" | "BILINEAR" | "TRILINEAR",
        flip: boolean,
        generateMipmaps: boolean
    }
    export type Texture = TextureBase & {
        imageType: "Texture",
        sRGB: boolean,
        qualityLevel: number
    }
    export type NormalMap = TextureBase & {
        imageType: "NormalMap"
    }
    export type LightMap = TextureBase & {
        imageType: "LightMap"
    }
    export type Image = Texture | NormalMap | LightMap;

    export type Mesh = {
        type: "mesh"
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

    export type AssetProperty = Other | Image | Mesh | Prefab | Scene | Hdr;
}
