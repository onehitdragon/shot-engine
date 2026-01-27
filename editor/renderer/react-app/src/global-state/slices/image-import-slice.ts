import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Imports } from "../../engine-zod";

type State = {
    imports: {
        images: Imports.Image[]
    } | null
};
const initialState: State = {
    imports: null
};

const slice = createSlice({
    initialState,
    name: "image-import",
    reducers: {
        updateImports: (state, action: PayloadAction<{ imports: State["imports"] }>) => {
            state.imports = action.payload.imports;
        }
    }
});

export const { updateImports } = slice.actions;
export default slice.reducer;
