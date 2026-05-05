import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import type { AssetManager, PrefabAsset } from "@shot-engine/types";
import { componentsInpectedThunk } from "./inspector-components-thunks";
import { showInspector } from "../slices/inspector-slice";
import { type NodeState } from "../slices/go-tree-slice";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";

export const nodeFocusedThunk = createAsyncThunk
<
    void,
    {
        node: NodeState
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/nodeFocused",
    async ({ node }, { getState, dispatch, rejectWithValue }) => {
        try{
            if("prefabRef" in node){
                const assetInfo = await window.api.assetManager.getAssetInfoFromUuid(node.prefabRef);
                if(!assetInfo) throw "cant find asset info";
                const asset = await window.api.assetManager.getAssetFromUuid(node.prefabRef, "prefab");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({
                    inspector: {
                        type: "prefab",
                        assetInfo,
                        prefabAsset: asset as PrefabAsset,
                    }
                }));
            }
            else{
                dispatch(componentsInpectedThunk({
                    id: node.id,
                    components: node.components,
                    allowModify: getState().goTree.allowModify ?? false
                }));
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const nodeUnfocusedThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/nodeUnfocused",
    async (_, { dispatch, rejectWithValue }) => {
        try{
            dispatch(showInspector({
                inspector: null
            }));
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const goTreeOpenedThunk = createAsyncThunk
<
    {
        // resources: ResourceManager.Resource[]
    },
    {
        assetInfo?: AssetManager.AssetInfo,
        rootIds: string[],
        nodes: NodeState[],
        allowModify?: boolean,
        allowAddRoot?: boolean,
        allowRemoveRoot?: boolean,
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/goTreeOpened",
    async (_, { getState, rejectWithValue }) => {
        try{
            if(getState().goTree.opened && getState().goTree.modified){
                const yes = await window.api.showConfirm("without saving?");
                if(!yes) return rejectWithValue("require save");
            }
            return {}
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const goTreeClosedThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/goTreeClosed",
    async (_, { getState, rejectWithValue }) => {
        try{
            if(getState().goTree.opened && getState().goTree.modified){
                const yes = await window.api.showConfirm("without saving?");
                if(!yes) return rejectWithValue("require save");
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const goTreeSavedThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/goTreeSaved",
    async (_, { rejectWithValue }) => {
        try{
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const goAddedThunk = createAsyncThunk
<
    {
        nodeOut: NodeState
        // resources: ResourceManager.Resource[]
    },
    {
        node: NodeState
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/goAdded",
    async ({ node }, { getState, rejectWithValue }) => {
        try{
            if(!getState().goTree.allowModify) throw "cant modify";
            if(!("prefabRef" in node)){
                if(node.childs.length > 0) throw "cant add node with childs";
            }
            if(node.parent){
                const parentNode = getState().goTree.nodes.entities[node.parent];
                if(!parentNode) throw "cant find parent";
                if("prefabRef" in parentNode) throw "cant add to prefab, pls modify prefab directly";
            }
            if(!node.parent){
                if(!getState().goTree.allowAddRoot) throw "cant add root";
            }
            const nodeOut = cloneDeep(node);
            nodeOut.id = uuidv4();
            // const resources = await useResourceByComponents(
            //     components,
            //     getState().assetManager.entities,
            //     getState().resourceManager.entities,
            //     projectPaths.resource
            // );

            return {
                nodeOut
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const goRemovedThunk = createAsyncThunk
<
    {
        removeIds: string[]
    },
    {
        node: NodeState
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "goTree/goRemoved",
    async ({ node }, { getState, dispatch, rejectWithValue }) => {
        try{
            if(!getState().goTree.allowModify) throw "cant modify";
            if(!node.parent){
                if(!getState().goTree.allowRemoveRoot) throw "cant remove root";
            }
            const removeIds: string[] = [];
            function recur(nodeIn: NodeState){
                removeIds.push(nodeIn.id);
                if(!("prefabRef" in nodeIn)){
                    for(const childId of nodeIn.childs){
                        const child = getState().goTree.nodes.entities[childId];
                        if(!child) continue;
                        recur(child);
                    }
                }
            }
            recur(node);

            dispatch(showInspector({ inspector: null }));

            return {
                removeIds
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
