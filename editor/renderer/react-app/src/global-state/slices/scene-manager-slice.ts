import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { sceneOpenedThunk, sceneSavedThunk } from "../thunks/scene-manager-thunks";

const nodeAdapter = createEntityAdapter<SceneFormat.SceneNode, string>({
    selectId: (node) => node.id
});
const componentAdapter = createEntityAdapter<Components.Component, string>({
    selectId: (component) => component.id
});
interface InitState{
    nodes: EntityState<SceneFormat.SceneNode, string>,
    components: EntityState<Components.Component, string>,
    scene: SceneFormat.Scene | null,
    path: string | null,
    modified: boolean,
    focusedId: string | null,
}
const initialState: InitState = {
    nodes: nodeAdapter.getInitialState(),
    components: componentAdapter.getInitialState(),
    scene: null,
    path: null,
    modified: false,
    focusedId: null
};
const slice = createSlice({
    initialState,
    name: "sceneManager",
    reducers: {
        focusSceneNode: (state, action: PayloadAction<{ id: string }>) => {
            state.focusedId = action.payload.id;
        },
        unfocusSceneNode: (state) => {
            state.focusedId = null;
        },

        closeScene: (state) => {
            state.scene = null;
            state.focusedId = null;
            state.path = null;
            state.modified = false;
            nodeAdapter.removeAll(state.nodes);
            componentAdapter.removeAll(state.components);
        },
        addSceneNode: (state, action: PayloadAction<{
            nodeId: string,
            parentId: SceneFormat.SceneNode["parent"],
            nodes: SceneFormat.SceneNode[],
            components: Components.Component[]
        }>) => {
            const { nodeId, parentId, nodes, components } = action.payload;
            if(!parentId){
                const scene = state.scene;
                if(!scene) return;
                scene.nodes.push(nodeId);
            }
            else{
                const parent = state.nodes.entities[parentId];
                if(!parent) return;
                parent.childs.push(nodeId);
            }
            nodeAdapter.addMany(state.nodes, nodes);
            componentAdapter.addMany(state.components, components);
            state.modified = true;
        },
        removeSceneNode: (state, action: PayloadAction<{
            id: string,
            nodeIds: string[],
            componentIds: string[]
        }>) => {
            const { id, nodeIds, componentIds } = action.payload;
            const node = state.nodes.entities[id];
            if(!node) return;
            if(!node.parent){
                const scene = state.scene;
                if(!scene) return;
                scene.nodes = scene.nodes.filter(nodeId => nodeId !== id);
            }
            else{
                const parent = state.nodes.entities[node.parent];
                if(!parent) return;
                parent.childs = parent.childs.filter(nodeId => nodeId !== id);
            }
            nodeAdapter.removeMany(state.nodes, nodeIds);
            componentAdapter.removeMany(state.components, componentIds);
            state.modified = true;
        },
        updateComponentOfSceneNode: (
            state,
            action: PayloadAction<{ component: Components.Component }>
        ) => {
            const { component } = action.payload;
            componentAdapter.updateOne(state.components, { id: component.id, changes: component });
            state.modified = true;
        },

        renameSceneNode: (state, action: PayloadAction<{ nodeId: string, newName: string }>) => {
            const { nodeId, newName } = action.payload;
            nodeAdapter.updateOne(state.nodes, { id: nodeId, changes: { name: newName } });
            state.modified = true;
        },
        addUniqueComponentToSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, component: Components.Component }>
        ) => {
            const { nodeId, component } = action.payload;
            const nodeFound = state.nodes.entities[nodeId];
            if(!nodeFound) return;
            for(const componentId of nodeFound.components){
                const componentFound = state.components.entities[componentId];
                if(!componentFound) continue;
                if(componentFound.type === component.type) return;
                if(componentFound.id === component.id) return;
            }
            nodeFound.components.push(component.id);
            componentAdapter.addOne(state.components, component);
            state.modified = true;
        },
        removeComponentOfSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, componentId: string }>
        ) => {
            const { nodeId, componentId } = action.payload;
            const nodeFound = state.nodes.entities[nodeId];
            if(!nodeFound) return;
            const componentFound = state.components.entities[componentId];
            if(!componentFound) return;
            const { type } = componentFound;
            if(type === "Transform" || type === "Mesh") return;
            nodeFound.components = nodeFound.components.filter((id) => id !== componentId);
            componentAdapter.removeOne(state.components, componentId);
            state.modified = true;
        }
    },
    extraReducers(builder){
        builder.addAsyncThunk(
            sceneSavedThunk,
            {
                fulfilled: (state, action) => {
                    const { savedPath } = action.payload;
                    state.path = savedPath;
                    state.modified = false;
                }
            }
        );
        builder.addAsyncThunk(
            sceneOpenedThunk,
            {
                fulfilled: (state, action) => {
                    const { scene, nodes, components } = action.meta.arg;
                    state.scene = scene;
                    nodeAdapter.removeAll(state.nodes);
                    componentAdapter.removeAll(state.components);
                    nodeAdapter.addMany(state.nodes, nodes);
                    componentAdapter.addMany(state.components, components);
                }
            }
        );
    }
});
export const {
    selectById: selectSceneNodeById,
    selectEntities: selectSceneNodeRecord,
    selectAll: selectSceneNodes
} = nodeAdapter.getSelectors((state: RootState) => state.sceneManager.nodes);
export const {
    selectById: selectComponentById,
    selectEntities: selectComponentRecord,
    selectAll: selectComponents
} = componentAdapter.getSelectors((state: RootState) => state.sceneManager.components);
export const { focusSceneNode,
    unfocusSceneNode, closeScene, addSceneNode, removeSceneNode,
    updateComponentOfSceneNode, removeComponentOfSceneNode,
    renameSceneNode, addUniqueComponentToSceneNode } = slice.actions;
export default slice.reducer;