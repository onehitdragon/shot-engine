import { configureStore } from "@reduxjs/toolkit";
import folderManagerReducer from "./slices/folder-manager-slice";
import inspectorReducer from "./slices/inspector-slice";
import goTreeReducer from "./slices/go-tree-slice";
import contextMenuReducer from "./slices/context-menu-slice";
import appLoadingReducer from "./slices/app-loading-slice";
import appConfirmDialogReducer from "./slices/app-confirm-dialog-slice";
import resourceManagerReducer from "./slices/resource-manager-slice";
import { listenerMiddleware } from "./listenerMiddleware";
import inspectorComponentsReducer from "./slices/inspector-components-slice";
import sceneAssetReducer from "./slices/scene-asset-slice";
import prefabAssetReducer from "./slices/prefab-asset-slice";

export const store = configureStore({
    reducer: {
        folderManager: folderManagerReducer,
        inspector: inspectorReducer,
        goTree: goTreeReducer,
        contextMenu: contextMenuReducer,
        appLoading: appLoadingReducer,
        appConfirmDialog: appConfirmDialogReducer,
        resourceManager: resourceManagerReducer,
        inspectorComponents: inspectorComponentsReducer,
        sceneAsset: sceneAssetReducer,
        prefabAsset: prefabAssetReducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({serializableCheck: false}).prepend(listenerMiddleware.middleware);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
