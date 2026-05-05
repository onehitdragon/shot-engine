import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'
import { inspectorComponentsListener } from './thunks/inspector-components-thunks';
import { prefabAssetListener } from './thunks/prefab-asset-thunk';
export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof startAppListening;

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof addAppListener;

// listeners
inspectorComponentsListener(startAppListening);
prefabAssetListener(startAppListening);
