import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
    loading: boolean,
    logs: string[]
};
const initialState: State = {
    loading: false,
    logs: []
};
const slice = createSlice({
    initialState,
    name: "folder-manager",
    reducers: {
        updateLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
            state.loading = action.payload.loading;
            state.logs = [];
        },
        addLog: (state, action: PayloadAction<{ log: string }>) => {
            const time = new Date().toLocaleTimeString();
            state.logs.push(`[${time}] ${action.payload.log}`);
        }
    }
});

export default slice.reducer;
export const { updateLoading, addLog } = slice.actions;
