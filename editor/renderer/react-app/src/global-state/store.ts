import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/project-slice";
import folderManagerReducer from "./slices/folder-manager-slice";

export const store = configureStore({
    reducer: {
        project: projectReducer,
        folderManager: folderManagerReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
