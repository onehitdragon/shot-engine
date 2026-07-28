import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'
import { inspectorComponentsListener } from './thunks/inspector-components-thunks';
import { prefabAssetListener } from './thunks/prefab-asset-thunk';
import { sceneAssetListener } from './thunks/scene-asset-thunk';
import { nodesListener } from './thunks/go-tree-thunks';
import { gizmoOrbitCameraListener } from './thunks/gizmo-orbit-camera-thunk';
import { gizmoGoTreeListener } from './thunks/gizmo-go-tree-thunk';
export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof startAppListening;

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof addAppListener;

// listeners
gizmoOrbitCameraListener(startAppListening);
inspectorComponentsListener(startAppListening);
prefabAssetListener(startAppListening);
sceneAssetListener(startAppListening);
nodesListener(startAppListening);
gizmoGoTreeListener(startAppListening);
