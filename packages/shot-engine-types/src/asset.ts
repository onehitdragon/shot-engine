import { GameObject, Scene, AABB } from "./engine.js"

export type OtherAsset = {
    content: string
}
export type ImageAsset = {
    ktx2: Uint8Array
}
export type MeshAsset = {
    primitives: {
        type: "static" | "skin",
        attribute: {
            // vertex(3) 12 bytes, normal(3) 12 bytes, uv(2) 8 bytes, tangent(3) 12 bytes
            // weight(4) 16 bytes, joint(4 uint) 4 bytes
            interleaveArray: Uint8Array,
        },
        indices: Uint8Array | Uint16Array | Uint32Array,
        indexType: number,
        drawMode: number,
        aabb: AABB,
        invBindPoseMatrices: Float32Array
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
export type Asset = OtherAsset | ImageAsset | MeshAsset | PrefabAsset | SceneAsset | HdrAsset | 
    FontAsset | TextAsset;
export function isPrefabAsset(asset?: Asset | null): asset is PrefabAsset{
    if(!asset) return false;
    return "root" in asset;
}

export type AssetType = "other" | "image" | "mesh" | "prefab" | "scene" | "hdr" | "font" | "text";
export namespace AssetProperty{
    export type Other = {
        type: "other"
    }

    export type TextureBase = {
        type: "image",
        generateMipmaps: boolean,
        wrapMode: "REPEAT" | "MIRROR" | "CLAMP",
        filterMode: "NONE" | "BILINEAR" | "TRILINEAR",
    }
    export type Texture = TextureBase & {
        imageType: "Texture",
        sRGB: boolean
    }
    export type NormalMap = TextureBase & {
        imageType: "NormalMap"
    }
    export type Image = Texture | NormalMap;

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

    export type Font = {
        type: "font"
    }

    export type Text = {
        type: "text"
    }

    export type AssetProperty = Other | Image | Mesh | Prefab | Scene | Hdr | Font | Text;
}
