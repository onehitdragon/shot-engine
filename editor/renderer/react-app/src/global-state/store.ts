import { configureStore } from "@reduxjs/toolkit";
import folderManagerReducer from "./slices/folder-manager-slice";
import inspectorReducer from "./slices/inspector-slice";
import sceneManagerReducer from "./slices/scene-manager-slice";
import contextMenuReducer from "./slices/context-menu-slice";
import imageImportReducer from "./slices/image-import-slice";
import appLoadingReducer from "./slices/app-loading-slice";
import { listenerMiddleware } from "./listenerMiddleware";

import "./thunks/folder-manager-listener";

export const store = configureStore({
    reducer: {
        folderManager: folderManagerReducer,
        inspector: inspectorReducer,
        sceneManager: sceneManagerReducer,
        contextMenu: contextMenuReducer,
        imageImport: imageImportReducer,
        appLoading: appLoadingReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({serializableCheck: false}).prepend(listenerMiddleware.middleware);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
