import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface SceneEntityState extends EntityState<SceneFormat.SceneNode, string> {
    scene: SceneFormat.Scene | null,
    path: string | null,
    modified: boolean,
    focusedId: string | null,
}
const adapter = createEntityAdapter<SceneFormat.SceneNode, string>({
    selectId: (entry) => entry.id
});
const initialState: SceneEntityState = adapter.getInitialState({
    scene: null,
    path: null,
    modified: false,
    focusedId: null
});
const slice = createSlice({
    initialState,
    name: "sceneManager",
    reducers: {
        updateScene: (state, action: PayloadAction<{
            scene: SceneFormat.Scene,
            nodes: SceneFormat.SceneNode[]
        }>) => {
            const { scene, nodes } = action.payload;
            state.scene = scene;
            adapter.removeAll(state);
            adapter.addMany(state, nodes);
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
            const { parentId, child } = action.payload;
            if(state.entities[child.id]) return;
            const parent = state.entities[parentId];
            if(!parent) return;
            parent.childs.push(child.id);
            adapter.addOne(state, child);
            state.modified = true;
        },
        addTopSceneNode: (state, action: PayloadAction<{ node: SceneFormat.SceneNode }>) => {
            const { node } = action.payload;
            if(state.entities[node.id]) return;
            const scene = state.scene;
            if(!scene) return;
            scene.nodes.push(node.id);
            adapter.addOne(state, node);
            state.modified = true;
        },
        removeChildSceneNode: (state, action: PayloadAction<{ parentId: string, chilId: string }>) => {
            const { parentId, chilId } = action.payload;
            const parent = state.entities[parentId];
            if(!parent) return;
            const index = parent.childs.findIndex(child => child === chilId);
            if(index == -1) return;
            parent.childs.splice(index, 1);
            adapter.removeOne(state, chilId);
            state.modified = true;
        },
        removeTopSceneNode: (state, action: PayloadAction<{ id: string }>) => {
            const scene = state.scene;
            if(!scene) return;
            const { id } = action.payload;
            const index = scene.nodes.findIndex(nodeId => nodeId === id);
            if(index == -1) return;
            scene.nodes.splice(index, 1);
            adapter.removeOne(state, id);
            state.modified = true;
        },
        renameSceneNode: (state, action: PayloadAction<{ nodeId: string, newName: string }>) => {
            const { nodeId, newName } = action.payload;
            adapter.updateOne(state, { id: nodeId, changes: { name: newName } });
            state.modified = true;
        },
        addUniqueComponentToSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, component: Components.Component }>
        ) => {
            const { nodeId, component } = action.payload;
            const nodeFound = state.entities[nodeId];
            if(!nodeFound) return;
            const sameComponent = nodeFound.components.find(c => c.type === component.type);
            if(sameComponent) return;
            nodeFound.components.push(component);
            state.modified = true;
        },
        removeComponentOfSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, componentId: string }>
        ) => {
            const { nodeId, componentId } = action.payload;
            const nodeFound = state.entities[nodeId];
            if(!nodeFound) return;
            const index = nodeFound.components.findIndex((c) => c.id == componentId);
            if(index == -1) return;
            const component = nodeFound.components[index];
            const { type } = component;
            if(type === "Transform" || type === "Mesh") return;
            nodeFound.components.splice(index, 1);
            state.modified = true;
        },
        updateComponentOfSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, component: Components.Component }>
        ) => {
            const { nodeId, component } = action.payload;
            const nodeFound = state.entities[nodeId];
            if(!nodeFound) return;
            const index = nodeFound.components.findIndex((c) => c.id == component.id);
            if(index == -1) return;
            nodeFound.components[index] = component;
            state.modified = true;
        }
    }
});
export const {
  selectById: selectSceneNodeById,
  selectEntities: selectSceneNodeRecord,
  selectAll: selectSceneNodes
} = adapter.getSelectors((state: RootState) => state.sceneManager);
function selectFocusedSceneNode(state: RootState){
    const { focusedId } = state.sceneManager;
    if(!focusedId) return null;
    return selectSceneNodeById(state, focusedId);
}
export const { updateScene, updateSceneModified, updateScenePath, focusSceneNode,
    unfocusSceneNode, addSceneNodeChild, removeChildSceneNode, removeTopSceneNode, addTopSceneNode,
    updateComponentOfSceneNode, removeComponentOfSceneNode,
    renameSceneNode, addUniqueComponentToSceneNode } = slice.actions;
export { selectFocusedSceneNode }
export default slice.reducer;