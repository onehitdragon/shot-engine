import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { sceneOpenedThunk, sceneSavedThunk } from "../thunks/scene-manager-thunks";
import { entryDeletedThunk, fileImportedThunk, folderCreatedThunk, projectClosedThunk, projectOpenedThunk } from "../thunks/folder-manager-thunks";

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
    name: "app-loading",
    reducers: {
        updateLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
            state.loading = action.payload.loading;
            state.logs = [];
        },
        addLog: (state, action: PayloadAction<{ log: string }>) => {
            const time = new Date().toLocaleTimeString();
            state.logs.push(`[${time}] ${action.payload.log}`);
        }
    },
    extraReducers(builder){
        builder.addAsyncThunk(
            projectOpenedThunk,
            {
                pending: (state, action) => {
                    const { path } = action.meta.arg;
                    state.loading = true;
                    state.logs = [`Opening project... ${path}`];
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
        builder.addAsyncThunk(
            projectClosedThunk,
            {
                pending: (state) => {
                    state.loading = true;
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
        builder.addAsyncThunk(
            folderCreatedThunk,
            {
                pending: (state) => {
                    state.loading = true;
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
        builder.addAsyncThunk(
            fileImportedThunk,
            {
                pending: (state) => {
                    state.loading = true;
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
        builder.addAsyncThunk(
            entryDeletedThunk,
            {
                pending: (state) => {
                    state.loading = true;
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
        builder.addAsyncThunk(
            sceneSavedThunk,
            {
                pending: (state) => {
                    state.loading = true;
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
        builder.addAsyncThunk(
            sceneOpenedThunk,
            {
                pending: (state) => {
                    state.loading = true;
                },
                settled: (state) => {
                    state.loading = false;
                }
            }
        );
    }
});

export default slice.reducer;
export const { updateLoading, addLog } = slice.actions;
