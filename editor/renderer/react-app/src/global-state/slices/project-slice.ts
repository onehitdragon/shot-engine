import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
    loaded: boolean,
    folderPath: string
};
const initialState: State = {
    loaded: false,
    folderPath: ""
}
const slice = createSlice({
    initialState,
    name: "project",
    reducers: {
        loadProjectFolder: (state, action: PayloadAction<{ folderPath: string }>) => {
            state.loaded = true;
            state.folderPath = action.payload.folderPath;
        }
    }
});
export const { loadProjectFolder } = slice.actions;
export default slice.reducer;
