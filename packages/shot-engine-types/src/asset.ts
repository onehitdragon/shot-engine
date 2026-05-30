import { GameObject, Scene } from "./engine"

export type ImageAsset = {
    width: number,
    height: number,
    data: Uint8Array
}
export type MeshAsset = {
    primitives: {
        attribute: {
            interleaveArray: Float32Array,
        },
        indices: Uint8Array | Uint16Array | Uint32Array,
        indexType: number,
        drawMode: number,
    }[]
}
export type PrefabAsset = {
    root: GameObject
}
export type SceneAsset = {
    scene: Scene
}
export type HdrImage = { width: number, height: number, data: Float32Array };
export type HdrAsset = {
    enviromentMap: {
        right: HdrImage,
        left: HdrImage,
        top: HdrImage,
        bottom: HdrImage,
        font: HdrImage,
        back: HdrImage,
    }
}
export type Asset = ImageAsset | MeshAsset | PrefabAsset | SceneAsset | HdrAsset;

export type AssetType = "other" | "image" | "mesh" | "prefab" | "scene" | "hdr";
export namespace AssetProperty{
    export type Other = {
        type: "other"
    }

    export type TextureBase = {
        type: "image"
        wrapMode: "REPEAT" | "MIRROR" | "CLAMP",
        filterMode: "NONE" | "BILINEAR" | "TRILINEAR",
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
