import { GameObject } from "./engine"

export type ImageAsset = {
    width: number,
    height: number,
    data: Uint8Array
}
export type MeshAsset = {
    primitives: {
        attribute: {
            positions: Float32Array,
            normals: Float32Array,
            uvs: Float32Array
        },
        indices: Uint32Array
    }[]
}
export type PrefabAsset = {
    root: GameObject
}
