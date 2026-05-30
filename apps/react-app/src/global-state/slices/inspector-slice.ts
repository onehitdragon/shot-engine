import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ImageAsset, AssetManager, MeshAsset, PrefabAsset, SceneAsset, HdrAsset } from "@shot-engine/types";

export type TextAssetInspector = {
    type: "text",
    content: string
}
export type ImageAssetInspector = {
    type: "image",
    assetInfo: AssetManager.AssetInfo,
    imageAsset: ImageAsset,
}
export type MeshAssetInspector = {
    type: "mesh",
    assetInfo: AssetManager.AssetInfo,
    meshAsset: MeshAsset
}
export type PrefabAssetInspector = {
    type: "prefab",
    assetInfo: AssetManager.AssetInfo,
    prefabAsset: PrefabAsset
}
export type SceneAssetInspector = {
    type: "scene",
    assetInfo: AssetManager.AssetInfo,
    sceneAsset: SceneAsset
}
export type HdrAssetInspector = {
    type: "hdr",
    assetInfo: AssetManager.AssetInfo,
    hdrAsset?: HdrAsset
}
export type ComponentsInspector = {
    type: "components"
}

type State = {
    inspector: null | ImageAssetInspector | TextAssetInspector | PrefabAssetInspector
    | SceneAssetInspector | MeshAssetInspector | ComponentsInspector | HdrAssetInspector
};
const initialState: State = {
    inspector: null
}
const slice = createSlice({
    initialState,
    name: "inspector",
    reducers: {
        showInspector: (state, action: PayloadAction<{ inspector: State["inspector"] }>) => {
            state.inspector = action.payload.inspector;
        }
    }
});
export const { showInspector } = slice.actions;
export default slice.reducer;