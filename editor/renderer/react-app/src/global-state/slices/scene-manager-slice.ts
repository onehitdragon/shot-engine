import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
    sceneGraph: SceneFormat.SceneGraph | null,
    path: string | null,
    modified: boolean
};
const initialState: State = {
    sceneGraph: null,
    path: null,
    modified: false
}
const slice = createSlice({
    initialState,
    name: "sceneManager",
    reducers: {
        updateScene: (state, action: PayloadAction<{ sceneGraph: SceneFormat.SceneGraph }>) => {
            state.sceneGraph = action.payload.sceneGraph;
        },
        updateSceneModified: (state, action: PayloadAction<{ value: boolean }>) => {
            state.modified = action.payload.value;
        },
        updateScenePath: (state, action: PayloadAction<{ path: string | null }>) => {
            state.path = action.payload.path;
        }
    }
});
export const { updateScene, updateSceneModified, updateScenePath } = slice.actions;
export default slice.reducer;