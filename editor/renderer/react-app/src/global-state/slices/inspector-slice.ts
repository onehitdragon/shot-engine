import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TextInspector = {
    type: "text",
    content: string
}
export type FBXInspector = {
    type: "fbx",
    fbx: FBXFormat.FBX
}
export type MeshInspector = {
    type: "mesh",
    mesh: MeshFormat.Mesh
}
export type PrefabInspector = {
    type: "prefab",
    prefab: PrefabFormat.Prefab
}
export type SceneInspector = {
    type: "scene",
    path: string,
    scene: SceneFormat.Scene,
    nodes: SceneFormat.SceneNode[],
    components: Components.Component[]
}
export type SceneNodeInspector = {
    type: "scene-node",
    nodeId: string
}
export type AssetInspector = {
    type: "asset",
    guid: string,
    path: string,
    metaPath: string
}
type State = {
    inspector: null | TextInspector | FBXInspector | PrefabInspector | SceneInspector | SceneNodeInspector
    | AssetInspector | MeshInspector
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