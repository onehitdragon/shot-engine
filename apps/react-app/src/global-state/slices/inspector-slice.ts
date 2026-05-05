import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ImageAsset, AssetManager, MeshAsset, PrefabAsset } from "@shot-engine/types";

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
export type ComponentsInspector = {
    type: "components"
}

export type SceneInspector = {
    type: "scene",
    path: string,
    scene: SceneFormat.Scene,
    nodes: SceneFormat.SceneNode[],
    components: Components.Component[]
}
type State = {
    inspector: null | ImageAssetInspector | TextAssetInspector | PrefabAssetInspector
    | SceneInspector | MeshAssetInspector | ComponentsInspector
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