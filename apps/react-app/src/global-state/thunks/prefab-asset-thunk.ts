import { isGameObjectPrefab, isPrefabAsset, type AssetManager, type GameObject, type GameObjectPrefab, type PrefabAsset, type SceneNode } from "@shot-engine/types";
import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { v4 as uuidv4 } from "uuid";
import { goTreeOpenedThunk, goTreeSavedThunk } from "./go-tree-thunks";
import type { AppStartListening } from "../listenerMiddleware";
import { selectNodeRecord, type NodeState } from "../slices/go-tree-slice";

export async function flatGameObject(sceneNodeIn: SceneNode){
    const nodeStates: NodeState[] = [];
    const idSet = new Set<string>();

    function getId(curId: string){
        if(!curId || idSet.has(curId)){
            let newId: string;
            do{
                newId = uuidv4();
            }
            while(idSet.has(newId));
            idSet.add(newId);
            return newId;
        }
        idSet.add(curId);
        return curId;
    }
    async function recur(sceneNode: SceneNode, parentId?: string, isPrefab?: boolean){
        let gameObject: GameObject;
        let prefabRef: string | undefined = undefined;
        if(isGameObjectPrefab(sceneNode)){
            const prefabAsset = await window.api.assetManager.getAssetFromUuid(sceneNode.prefabRef, "prefab");
            if(!isPrefabAsset(prefabAsset)) return;
            gameObject = prefabAsset.root;
            prefabRef = sceneNode.prefabRef;
            isPrefab = true;
        }
        else{
            gameObject = sceneNode;
        }
        
        const id = getId(gameObject.id);
        const childs: string[] = [];
        for(let child of gameObject.childs){
            const c = await recur(child, id, isPrefab);
            if(!c) continue;
            childs.push(c.id);
        }
        const nodeState: NodeState = {
            id,
            name: gameObject.name,
            components: gameObject.components,
            childs,
            parent: parentId,
            prefabRef,
            isPrefab
        };
        nodeStates.push(nodeState);
        return nodeState;
    }
    const root = await recur(sceneNodeIn);
    
    return {
        root,
        nodeStates
    }
}
export function nodeStateToSceneNode(rootIdIn: string, record: Record<string, NodeState>){
    function recur(rootId: string){
        const root = record[rootId];
        if(root.prefabRef){
            const goPrefab: GameObjectPrefab = {
                id: root.id,
                prefabRef: root.prefabRef
            }
            return goPrefab;
        }
        const childs: SceneNode[] = [];
        for(const childId of root.childs){
            childs.push(recur(childId));
        }
        const go: GameObject = {
            id: root.id,
            name: root.name,
            components: root.components.map(c => { return { ...c, id: "" }; }),
            childs
        }
        return go;
    }
    const root = recur(rootIdIn);
    return root;
}
export const prefabAssetOpenedThunk = createAsyncThunk
<
    void,
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
            const flat = await flatGameObject(prefabAsset.root);
            if(!flat.root) throw "prefab dont contain root";
            dispatch(goTreeOpenedThunk({
                assetInfo,
                rootIds: [flat.root.id],
                nodes: flat.nodeStates,
                allowAddRoot: false,
                allowRemoveRoot: false
            }));
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
                if(getState().goTree.assetInfo?.uuid !== prefabAssetInfo.uuid) return;
                if(!prefabAssetInfo.allowModify) throw "cant modify";
                const record = selectNodeRecord(getState());
                const sceneNodes = getState().goTree.rootIds.map(id => nodeStateToSceneNode(id, record));
                if(sceneNodes.length !== 1 || isGameObjectPrefab(sceneNodes[0])){
                    throw "cant save prefab, prefab only have one root, go tree is wrong";
                }
                const prefabAsset: PrefabAsset = {
                    root: sceneNodes[0] as GameObject
                }
                const filePath = await window.api.assetManager.getFilePathFromAssetId(prefabAssetInfo.uuid);
                if(!filePath) throw "cant find asset path to save";
                await window.api.assetManager.savePrefabAssetBinary(prefabAsset, filePath);
                await window.api.assetManager.rescan();
            }
            catch(err){
                await window.api.showError(String(err));
            }
        }
    });
}
