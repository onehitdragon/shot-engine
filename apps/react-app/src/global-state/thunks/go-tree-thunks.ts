import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { ComponentHelper, Mat4, Transform, Vec3, Vec4, type AssetManager } from "@shot-engine/types";
import { componentsChangedThunk, componentsInpectedThunk } from "./inspector-components-thunks";
import { showInspector } from "../slices/inspector-slice";
import { type NodeState } from "../slices/go-tree-slice";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import type { AppStartListening } from "../listenerMiddleware";
import { GizmoOrbitCameraInfo } from "./gizmo-orbit-camera-thunk";

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
    async ({ node }, { dispatch, rejectWithValue }) => {
        try{
            dispatch(componentsInpectedThunk({
                id: node.id,
                components: node.components,
                allowModify: node.isPrefab ? false : true
            }));
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
    void,
    {
        assetInfo?: AssetManager.AssetInfo,
        rootIds: string[],
        nodes: NodeState[],
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
            if(node.childs.length > 0) throw "cant add node with childs";
            if(node.parent){
                const parentNode = getState().goTree.nodes.entities[node.parent];
                if(!parentNode) throw "cant find parent";
                if(parentNode.isPrefab) throw "cant add to prefab, pls modify prefab directly";
            }
            if(!node.parent){
                if(!getState().goTree.allowAddRoot) throw "cant add root";
            }
            const nodeOut = cloneDeep(node);
            nodeOut.id = uuidv4();

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
            const parentId = node.parent;
            if(!parentId){
                if(!getState().goTree.allowRemoveRoot) throw "cant remove root";
            }
            else{
                const parentNode = getState().goTree.nodes.entities[parentId];
                if(!parentNode) throw "cant find parent";
                if(parentNode.isPrefab) throw "cant modify prefab";
            }
            const removeIds: string[] = [];
            function recur(nodeIn: NodeState){
                removeIds.push(nodeIn.id);
                for(const childId of nodeIn.childs){
                    const child = getState().goTree.nodes.entities[childId];
                    if(!child) continue;
                    recur(child);
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
export function nodesListener(startListening: AppStartListening){
    // go-tree
    startListening({
        matcher: isAnyOf(goTreeOpenedThunk.fulfilled),
        effect: ({  }, { getState }) => {
            NodesInfo.getInstance().reset();
            const { rootIds, nodes } = getState().goTree;
            NodesInfo.DFS(rootIds, nodes.entities);
        }
    });
    startListening({
        matcher: isAnyOf(goTreeClosedThunk.fulfilled),
        effect: ({  }, {  }) => {
            NodesInfo.getInstance().reset();
        }
    });
    startListening({
        matcher: isAnyOf(goAddedThunk.fulfilled),
        effect: (action, { getState }) => {
            const { nodes } = getState().goTree;
            if(goAddedThunk.fulfilled.match(action)){
                const id = action.payload.nodeOut.id;
                NodesInfo.DFS([id], nodes.entities);
            }
        }
    });
    startListening({
        matcher: isAnyOf(goRemovedThunk.fulfilled),
        effect: (action, {  }) => {
            if(goRemovedThunk.fulfilled.match(action)){
                const removeIds = action.payload.removeIds;
                NodesInfo.getInstance().deletes(removeIds);
            }
        }
    });
    startListening({
        matcher: isAnyOf(componentsChangedThunk.fulfilled),
        effect: (action, { getState, getOriginalState }) => {
            if(componentsChangedThunk.fulfilled.match(action)){
                const { id } = action.payload;
                const oldNode = getOriginalState().goTree.nodes.entities[id];
                const newNode = getState().goTree.nodes.entities[id];
                if(!newNode) return;
                if(!oldNode){
                    NodesInfo.DFS([id], getState().goTree.nodes.entities);
                    return;
                }
                const oldTransform = ComponentHelper.FindComponentByType(oldNode.components, "Transform");
                const newTransform = ComponentHelper.FindComponentByType(newNode.components, "Transform");
                if(!newTransform) return;
                if(!oldTransform){
                    NodesInfo.DFS([id], getState().goTree.nodes.entities);
                    return;
                }
                if(Transform.Equal(oldTransform, newTransform)) return;
                NodesInfo.DFS([id], getState().goTree.nodes.entities);
            }
        }
    });

    // gizmo-go-tree
    startListening({
        predicate: (_, curState, oldState) => {
            return (curState.gizmoOrbitCamera.camera !== oldState.gizmoOrbitCamera.camera) ||
            (curState.gizmoGoTree !== oldState.gizmoGoTree)
        },
        effect: ({  }, { getState }) => {
            const { rootIds, nodes } = getState().gizmoGoTree;
            const { camera } = getState().gizmoOrbitCamera;
            DFS(rootIds, nodes.entities);
            function DFS(
                nodeIds: string[],
                nodeRecord: Record<string, NodeState>,
                parentWorldMatrix?: Mat4
            ){
                for(const nodeId of nodeIds){
                    let node: NodeState;
                    node = nodeRecord[nodeId];
                    if(!node) return;
                    const transform = ComponentHelper.FindComponentByType(node.components, "Transform");
                    const gizmoTransform = ComponentHelper.FindComponentByType(node.components, "GizmoTransform");
                    let localMatrix: Mat4;
                    if(transform) localMatrix = Mat4.FromTRS(transform);
                    else if(gizmoTransform) localMatrix = NodesInfo.CreateGizmoModelMatrix(
                        gizmoTransform, camera.fov
                    );
                    else throw "dont find transform component";

                    let worldMatrix = localMatrix;
                    if(parentWorldMatrix){
                        worldMatrix = Mat4.Multiply(parentWorldMatrix, localMatrix);
                    }
                    NodesInfo.getInstance().nodeInfos.set(node.id, {
                        localMatrix,
                        worldMatrix,
                        parentWorldMatrix: parentWorldMatrix ?? localMatrix
                    });
                    DFS(node.childs, nodeRecord, worldMatrix);
                }
            }
        }
    });
}
export type NodeRenderState = {
    localMatrix: Mat4,
    worldMatrix: Mat4,
    parentWorldMatrix: Mat4
}
export class NodesInfo{
    private static _instance: NodesInfo;
    public nodeInfos: Map<string, NodeRenderState>;
    public static getInstance(){
        if(!this._instance){
            this._instance = new NodesInfo();
        }
        return this._instance;
    }
    private constructor(){
        this.nodeInfos = new Map();
    }
    public reset(){
        this.nodeInfos = new Map();
    }
    public deletes(nodeIds: string[]){
        for(const id of nodeIds) this.nodeInfos.delete(id);
    }
    public getWorldPos(nodeId: string){
        const worldMatrix = NodesInfo.getInstance().nodeInfos.get(nodeId)?.worldMatrix;
        if(!worldMatrix) return;
        return Mat4.GetTranslation(worldMatrix);
    }
    public static DFS(
        nodeIds: string[],
        nodeRecord: Record<string, NodeState>
    ){
        for(const nodeId of nodeIds){
            let node: NodeState;
            node = nodeRecord[nodeId];
            if(!node) continue;
            const transform = ComponentHelper.FindComponentByType(node.components, "Transform");
            if(!transform) continue;
            const localMatrix = Mat4.FromTRS(transform);
            let worldMatrix = localMatrix;

            const parentId = node.parent;
            let parentWorldMatrix: Mat4 | undefined = undefined;
            if(parentId){
                parentWorldMatrix = NodesInfo.getInstance().nodeInfos.get(parentId)?.worldMatrix
            }
            if(parentWorldMatrix){
                worldMatrix = Mat4.Multiply(parentWorldMatrix, localMatrix);
            }

            NodesInfo.getInstance().nodeInfos.set(node.id, {
                localMatrix,
                worldMatrix,
                parentWorldMatrix: parentWorldMatrix ?? localMatrix
            });
            this.DFS(node.childs, nodeRecord);
        }
    }
    public static CreateGizmoModelMatrix(transform: { pos: Vec3, rot: Vec4, scale: Vec3 }, fov: number){
        const { pos, rot, scale } = transform;
        let viewPos = Vec4.FromArray([pos.x, pos.y, pos.z, 1]);
        viewPos = Vec4.TransformMat4(viewPos, GizmoOrbitCameraInfo.getInstance().viewMat4);
        const dept = Math.abs(viewPos.z); // z-dep
        const gizmoScaler = 0.1; // settings
        const fovFactor = 2 * Math.tan(fov * 0.5);
        const gizmoScale = Vec3.Scale(scale, dept * fovFactor * gizmoScaler);
        return Mat4.FromTRS({ pos, rot, scale: gizmoScale });
    }
}

