import { configureStore } from "@reduxjs/toolkit";
import folderManagerReducer from "./slices/folder-manager-slice";
import inspectorReducer from "./slices/inspector-slice";
import sceneManagerReducer from "./slices/scene-manager-slice";
import contextMenuReducer from "./slices/context-menu-slice";
import assetManagerReducer from "./slices/asset-manager-slice";
import appLoadingReducer from "./slices/app-loading-slice";
import appConfirmDialogReducer from "./slices/app-confirm-dialog-slice";
import resourceManagerReducer from "./slices/resource-manager-slice";
import { listenerMiddleware } from "./listenerMiddleware";

export const store = configureStore({
    reducer: {
        folderManager: folderManagerReducer,
        inspector: inspectorReducer,
        sceneManager: sceneManagerReducer,
        contextMenu: contextMenuReducer,
        assetManager: assetManagerReducer,
        appLoading: appLoadingReducer,
        appConfirmDialog: appConfirmDialogReducer,
        resourceManager: resourceManagerReducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({serializableCheck: false}).prepend(listenerMiddleware.middleware);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
