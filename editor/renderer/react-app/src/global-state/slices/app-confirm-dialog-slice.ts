import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
    showing: boolean,
    content: string,
    yesCallback: Function | null
};
const initialState: State = {
    showing: false,
    content: "Confirm",
    yesCallback: null
};
const slice = createSlice({
    initialState,
    name: "app-confirm-dialog",
    reducers: {
        showDialog: (
            state, 
            action: PayloadAction<{ content: string, yesCallback: Function }>
        ) => {
            state.showing = true;
            state.content = action.payload.content;
            state.yesCallback = action.payload.yesCallback;
        },
        hideDialog: (state) => {
            state.showing = false;
        }
    }
});

export default slice.reducer;
export const { showDialog, hideDialog } = slice.actions;
