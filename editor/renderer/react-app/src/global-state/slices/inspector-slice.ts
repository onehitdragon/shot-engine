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
type State = {
    inspector: null | TextInspector | FBXInspector | SceneInspector
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