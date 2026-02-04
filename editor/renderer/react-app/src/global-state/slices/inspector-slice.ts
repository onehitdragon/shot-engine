import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TextInspector = {
    type: "text",
    content: string
}
export type FBXInspector = {
    type: "fbx",
    fbx: FBXFormat.FBX
}
export type AssimpInspector = {
    type: "assimp",
    assimp: AssimpFormat.Assimp
}
export type SceneInspector = {
    type: "scene",
    scene: SceneFormat.Scene
}
export type SceneNodeInspector = {
    type: "scene-node",
    scene: SceneFormat.Scene,
    node: SceneFormat.SceneNode
}
export type AssetInspector = {
    type: "asset",
    guid: string,
    metaPath: string
}
type State = {
    inspector: null | TextInspector | FBXInspector | AssimpInspector | SceneInspector | SceneNodeInspector
    | AssetInspector
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