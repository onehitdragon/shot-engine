import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type State = {
    scene: SceneFormat.Scene | null,
    path: string | null,
    modified: boolean,
    focusedId: string | null,
};
const initialState: State = {
    scene: null,
    path: null,
    modified: false,
    focusedId: null,
}
const slice = createSlice({
    initialState,
    name: "sceneManager",
    reducers: {
        updateScene: (state, action: PayloadAction<{ scene: SceneFormat.Scene }>) => {
            state.scene = action.payload.scene;
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
            const scene = state.scene;
            if(!scene) return;
            const sceneGraph = scene.sceneGraph;
            const { parentId, child } = action.payload;
            const parent = findSceneNode(sceneGraph.nodes, parentId);
            if(!parent) return;
            parent.childs.push(child);
            state.modified = true;
        },
        addTopSceneNode: (state, action: PayloadAction<{ node: SceneFormat.SceneNode }>) => {
            const scene = state.scene;
            if(!scene) return;
            const sceneGraph = scene.sceneGraph;
            const { node } = action.payload;
            sceneGraph.nodes.push(node);
            state.modified = true;
        },
        removeSceneNode: (state, action: PayloadAction<{ id: string }>) => {
            const scene = state.scene;
            if(!scene) return;
            const sceneGraph = scene.sceneGraph;
            const { id } = action.payload;
            removeSceneNodeHelper(sceneGraph.nodes, id);
            cleanupMeshHelper(sceneGraph.nodes, scene.meshes);
            state.modified = true;
        },
        renameSceneNode: (state, action: PayloadAction<{ nodeId: string, newName: string }>) => {
            const scene = state.scene;
            if(!scene) return;
            const sceneGraph = scene.sceneGraph;
            const { nodeId, newName } = action.payload;
            const nodeFound = findSceneNode(sceneGraph.nodes, nodeId);
            if(!nodeFound) return;
            nodeFound.name = newName;
            state.modified = true;
        },
        updateComponentOfSceneNode: (
            state,
            action: PayloadAction<{ nodeId: string, component: Components.Component }>
        ) => {
            const scene = state.scene;
            if(!scene) return;
            const sceneGraph = scene.sceneGraph;
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
            const scene = state.scene;
            if(!scene) return;
            const sceneGraph = scene.sceneGraph;
            const { nodeId, componentId } = action.payload;
            const nodeFound = findSceneNode(sceneGraph.nodes, nodeId);
            if(!nodeFound) return;
            const index = nodeFound.components.findIndex((c) => c.id == componentId);
            if(index == -1) return;
            const component = nodeFound.components[index];
            const { type } = component;
            if(type === "Transform" || type === "Mesh" || type === "Shading") return;
            nodeFound.components.splice(index, 1);
            state.modified = true;
        },
        addMesh: (state, action: PayloadAction<{ mesh: SceneFormat.Mesh }>) => {
            const scene = state.scene;
            if(!scene) return;
            const { mesh } = action.payload;
            const { meshes } = scene;
            const meshFound = meshes.find((m) => m.id == mesh.id);
            if(meshFound) return;
            meshes.push(mesh);
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
    const { focusedId, scene } = state.sceneManager;
    if(!focusedId || !scene) return null;
    const sceneGraph = scene.sceneGraph;
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
function sceneGraphLooper(
    sceneNodes: SceneFormat.SceneNode[],
    action: (
        sceneNode: SceneFormat.SceneNode,
        parent: SceneFormat.SceneNode | null,
        childIndex: number
    ) => void,
    parent: SceneFormat.SceneNode | null = null
){
    for(let i = 0; i < sceneNodes.length; i++){
        const node = sceneNodes[i];
        action(node, parent, i);
        sceneGraphLooper(node.childs, action, node);
    }
}
function cleanupMeshHelper(sceneNodes: SceneFormat.SceneNode[], meshes: SceneFormat.Mesh[]){
    const usedMeshs = new Set<string>();
    sceneGraphLooper(sceneNodes, (sceneNode) => {
        const meshComponent = sceneNode.components.find(c => c.type === "Mesh");
        if(!meshComponent) return;
        usedMeshs.add(meshComponent.meshId);
    });
    for(let i = meshes.length - 1; i >= 0; i--){
        const mesh = meshes[i];
        if(!usedMeshs.has(mesh.id)) meshes.splice(i, 1);
    }
}

export const { updateScene, updateSceneModified, updateScenePath, focusSceneNode,
    unfocusSceneNode, addSceneNodeChild, removeSceneNode, addTopSceneNode,
    updateComponentOfSceneNode, removeComponentOfSceneNode,
    renameSceneNode, addMesh } = slice.actions;
export { selectFocusedSceneNode }
export default slice.reducer;