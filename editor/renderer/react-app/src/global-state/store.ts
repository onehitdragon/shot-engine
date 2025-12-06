import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/project-slice";
import folderManagerReducer from "./slices/folder-manager-slice";
import inspectorReducer from "./slices/inspector-slice";

export const store = configureStore({
    reducer: {
        project: projectReducer,
        folderManager: folderManagerReducer,
        inspector: inspectorReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
