import type { AssetManager, GameObject, GameObjectPrefab, PrefabAsset, SceneNode } from "@shot-engine/types";
import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { v4 as uuidv4 } from "uuid";
import { goTreeOpenedThunk, goTreeSavedThunk } from "./go-tree-thunks";
import type { AppStartListening } from "../listenerMiddleware";
import { selectNodeRecord, type NodeState } from "../slices/go-tree-slice";

export function flatGameObject(sceneNodeIn: SceneNode){
    const nodeStates: NodeState[] = [];

    function recur(sceneNode: SceneNode, parentId?: string){
        if("prefabRef" in sceneNode){
            const goPrefab: NodeState = {
                ...sceneNode,
                id: uuidv4(),
                parent: parentId
            }
            nodeStates.push(goPrefab);
            return goPrefab;
        }
        const id = uuidv4();
        const childs: string[] = [];
        for(let child of sceneNode.childs){
            const c = recur(child, id);
            childs.push(c.id);
        }
        const go: NodeState = {
            ...sceneNode,
            childs,
            parent: parentId,
            id
        };
        nodeStates.push(go);
        return go;
    }
    const root = recur(sceneNodeIn);
    
    return {
        root,
        nodeStates
    }
}
export function contructGameObject(rootIdIn: string, record: Record<string, NodeState>){
    function recur(rootId: string){
        const root = record[rootId];
        if("prefabRef" in root){
            const goPrefab: GameObjectPrefab = {
                ...root,
                id: "",
            }
            return goPrefab;
        }
        const childs: SceneNode[] = [];
        for(const childId of root.childs){
            childs.push(recur(childId));
        }
        const go: GameObject = {
            ...root,
            childs,
            components: root.components.map(c => { return { ...c, id: "" }; }),
            id: ""
        }
        return go;
    }
    const root = recur(rootIdIn);
    return root;
}
export const prefabAssetOpenedThunk = createAsyncThunk
<
    {},
    {
        assetInfo: AssetManager.AssetInfo,
        prefabAsset: PrefabAsset
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "prefabAsset/prefabAssetOpened",
    async ({ assetInfo, prefabAsset }, { dispatch, rejectWithValue }) => {
        try{
            const flat = flatGameObject(prefabAsset.root);
            dispatch(goTreeOpenedThunk({
                assetInfo,
                rootIds: [flat.root.id],
                nodes: flat.nodeStates,
                allowModify: assetInfo.allowModify,
                allowAddRoot: false,
                allowRemoveRoot: false
            }));
            return {}
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export function prefabAssetListener(startListening: AppStartListening){
    startListening({
        matcher: isAnyOf(goTreeSavedThunk.fulfilled),
        effect: async (_, { getState }) => {
            try{
                const prefabAssetInfo = getState().prefabAsset.assetInfo;
                if(!prefabAssetInfo) return;
                if(!prefabAssetInfo.allowModify) throw "cant modify";
                if(getState().goTree.assetInfo?.uuid !== prefabAssetInfo.uuid) return;
                const record = selectNodeRecord(getState());
                const sceneNodes = getState().goTree.rootIds.map(id => contructGameObject(id, record));
                if(sceneNodes.length !== 1 || "prefabRef" in sceneNodes[0]){
                    throw "cant save prefab, go tree is wrong";
                }
                const prefabAsset: PrefabAsset = {
                    root: sceneNodes[0] as GameObject
                }
                const filePath = await window.api.assetManager.getFilePathFromAssetId(prefabAssetInfo.uuid);
                if(!filePath) throw "cant asset find path to save";
                await window.api.assetManager.savePrefabAssetBinary(prefabAsset, filePath);
                await window.api.assetManager.rescan();
            }
            catch(err){
                await window.api.showError(String(err));
            }
        }
    });
}
