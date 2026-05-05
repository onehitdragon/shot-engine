import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import type { AssetManager, SceneAsset } from "@shot-engine/types";
import { contructGameObject, flatGameObject } from "./prefab-asset-thunk";
import { goTreeOpenedThunk, goTreeSavedThunk } from "./go-tree-thunks";
import { selectNodeRecord, type NodeState } from "../slices/go-tree-slice";
import type { AppStartListening } from "../listenerMiddleware";

export const sceneAssetOpenedThunk = createAsyncThunk
<
    {},
    {
        assetInfo: AssetManager.AssetInfo,
        sceneAsset: SceneAsset
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "sceneAsset/sceneAssetOpened",
    async ({ assetInfo, sceneAsset }, { dispatch, rejectWithValue }) => {
        try{
            const rootIds: string[] = [];
            const nodes: NodeState[] = [];
            for(const sceneNode of sceneAsset.scene.roots){
                const flat = flatGameObject(sceneNode);
                rootIds.push(flat.root.id);
                nodes.push(...flat.nodeStates);
            }
            dispatch(goTreeOpenedThunk({
                assetInfo,
                rootIds,
                nodes,
                allowModify: true,
                allowAddRoot: true,
                allowRemoveRoot: true,
            }));
            return {}
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export function sceneAssetListener(startListening: AppStartListening){
    startListening({
        matcher: isAnyOf(goTreeSavedThunk.fulfilled),
        effect: async (_, { getState }) => {
            try{
                const assetInfo = getState().sceneAsset.assetInfo;
                const sceneAsset = getState().sceneAsset.sceneAsset;
                if(!assetInfo || !sceneAsset) return;
                if(!assetInfo.allowModify) throw "cant modify";
                if(getState().goTree.assetInfo?.uuid !== assetInfo.uuid) return;
                const record = selectNodeRecord(getState());
                const sceneNodes = getState().goTree.rootIds.map(id => contructGameObject(id, record));
                const sceneAssetOut: SceneAsset = {
                    scene: {
                        id: "",
                        name: sceneAsset.scene.name,
                        roots: sceneNodes
                    }
                }
                const filePath = await window.api.assetManager.getFilePathFromAssetId(assetInfo.uuid);
                if(!filePath) throw "cant find asset path to save";
                await window.api.assetManager.saveSceneAssetBinary(sceneAssetOut, filePath);
                await window.api.assetManager.rescan();
            }
            catch(err){
                await window.api.showError(String(err));
            }
        }
    });
}
