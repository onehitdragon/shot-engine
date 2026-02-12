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

        openScene: (state, action: PayloadAction<{
            scene: SceneFormat.Scene,
            nodes: SceneFormat.SceneNode[]
        }>) => {
            state.scene = action.payload.scene;
            adapter.removeAll(state);
            adapter.addMany(state, action.payload.nodes)
        },
        closeScene: (state) => {
            state.scene = null;
            state.focusedId = null;
            state.path = null;
            state.modified = false;
            adapter.removeAll(state);
        },
        addSceneNode: (state, action: PayloadAction<{
            nodeId: string,
            parentId: SceneFormat.SceneNode["parent"],
            nodes: SceneFormat.SceneNode[]
        }>) => {
            const { nodeId, parentId, nodes } = action.payload;
            if(!parentId){
                const scene = state.scene;
                if(!scene) return;
                scene.nodes.push(nodeId);
            }
            else{
                const parent = state.entities[parentId];
                if(!parent) return;
                parent.childs.push(nodeId);
            }
            adapter.addMany(state, nodes);
            state.modified = true;
        },
        removeSceneNode: (state, action: PayloadAction<{
            id: string,
            nodeIds: string[]
        }>) => {
            const { id, nodeIds } = action.payload;
            const node = state.entities[id];
            if(!node) return;
            if(!node.parent){
                const scene = state.scene;
                if(!scene) return;
                scene.nodes = scene.nodes.filter(nodeId => nodeId !== id);
            }
            else{
                const parent = state.entities[node.parent];
                if(!parent) return;
                parent.childs = parent.childs.filter(nodeId => nodeId !== id);
            }
            adapter.removeMany(state, nodeIds);
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
export const { updateSceneModified, updateScenePath, focusSceneNode,
    unfocusSceneNode, openScene, closeScene, addSceneNode, removeSceneNode,
    updateComponentOfSceneNode, removeComponentOfSceneNode,
    renameSceneNode, addUniqueComponentToSceneNode } = slice.actions;
export { selectFocusedSceneNode }
export default slice.reducer;