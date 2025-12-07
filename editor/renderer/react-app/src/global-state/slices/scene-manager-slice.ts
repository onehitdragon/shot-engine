import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type State = {
    sceneGraph: SceneFormat.SceneGraph | null,
    path: string | null,
    modified: boolean,
    focusedId: string | null,
};
const initialState: State = {
    sceneGraph: null,
    path: null,
    modified: false,
    focusedId: null,
}
const slice = createSlice({
    initialState,
    name: "sceneManager",
    reducers: {
        updateScene: (state, action: PayloadAction<{ sceneGraph: SceneFormat.SceneGraph }>) => {
            state.sceneGraph = action.payload.sceneGraph;
        },
        updateSceneModified: (state, action: PayloadAction<{ value: boolean }>) => {
            state.modified = action.payload.value;
        },
        updateScenePath: (state, action: PayloadAction<{ path: string | null }>) => {
            state.path = action.payload.path;
        },
        focusSceneNode: (state, action: PayloadAction<{ id: string }>) => {
            state.focusedId = action.payload.id;
        },
        unfocusSceneNode: (state) => {
            state.focusedId = null;
        },
        addSceneNodeChild: (state, action: PayloadAction<{ parentId: string, child: SceneFormat.SceneNode }>) => {
            const sceneGraph = state.sceneGraph;
            if(!sceneGraph) return;
            const { parentId, child } = action.payload;
            const parent = findSceneNode(sceneGraph.nodes, parentId);
            if(!parent) return;
            parent.childs.push(child);
            state.modified = true;
        },
        addTopSceneNode: (state, action: PayloadAction<{ node: SceneFormat.SceneNode }>) => {
            const sceneGraph = state.sceneGraph;
            if(!sceneGraph) return;
            const { node } = action.payload;
            sceneGraph.nodes.push(node);
            state.modified = true;
        },
        removeSceneNode: (state, action: PayloadAction<{ id: string }>) => {
            const sceneGraph = state.sceneGraph;
            if(!sceneGraph) return;
            const { id } = action.payload;
            removeSceneNodeHelper(sceneGraph.nodes, id);
            state.modified = true;
        },
        updateComponentOfSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, component: Components.Component }>
        ) => {
            const sceneGraph = state.sceneGraph;
            if(!sceneGraph) return;
            const { nodeId, component } = action.payload;
            const nodeFound = findSceneNode(sceneGraph.nodes, nodeId);
            if(!nodeFound) return;
            const index = nodeFound.components.findIndex((c) => c.id == component.id);
            if(index == -1) return;
            nodeFound.components[index] = component;
            state.modified = true;
        },
        removeComponentOfSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, componentId: string }>
        ) => {
            const sceneGraph = state.sceneGraph;
            if(!sceneGraph) return;
            const { nodeId, componentId } = action.payload;
            const nodeFound = findSceneNode(sceneGraph.nodes, nodeId);
            if(!nodeFound) return;
            const index = nodeFound.components.findIndex((c) => c.id == componentId);
            if(index == -1) return;
            nodeFound.components.splice(index, 1);
            state.modified = true;
        }
    }
});
function findSceneNode(sceneNodes: SceneFormat.SceneNode[], id: string): SceneFormat.SceneNode | null{
    for(const sceneNode of sceneNodes){
        if(sceneNode.id == id) return sceneNode;
        const sceneNodeFound = findSceneNode(sceneNode.childs, id);
        if(sceneNodeFound) return sceneNodeFound;
    }
    return null;
}
function selectFocusedSceneNode(state: RootState){
    const { focusedId, sceneGraph } = state.sceneManager;
    if(!focusedId || !sceneGraph) return null;
    return findSceneNode(sceneGraph.nodes, focusedId);
}
function removeSceneNodeHelper(sceneNodes: SceneFormat.SceneNode[], id: string){
    for(let i = 0; i < sceneNodes.length; i++){
        const sceneNode = sceneNodes[i];
        if(sceneNode.id == id){
            sceneNodes.splice(i, 1);
            return true;
        }
        if(removeSceneNodeHelper(sceneNode.childs, id)) return true;
    }
    return false;
}

export const { updateScene, updateSceneModified, updateScenePath, focusSceneNode,
    unfocusSceneNode, addSceneNodeChild, removeSceneNode, addTopSceneNode,
    updateComponentOfSceneNode, removeComponentOfSceneNode } = slice.actions;
export { selectFocusedSceneNode }
export default slice.reducer;