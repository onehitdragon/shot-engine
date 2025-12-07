import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TextInspector = {
    type: "text",
    content: string
}
export type FBXInspector = {
    type: "fbx",
    fbx: FBXFormat.FBX
}
export type SceneInspector = {
    type: "scene",
    sceneGraph: SceneFormat.SceneGraph
}
export type SceneNodeInspector = {
    type: "scene-node",
    node: SceneFormat.SceneNode
}
type State = {
    inspector: null | TextInspector | FBXInspector | SceneInspector | SceneNodeInspector
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