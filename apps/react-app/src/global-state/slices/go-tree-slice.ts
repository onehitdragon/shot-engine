import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { AssetManager, GameObject } from "@shot-engine/types";
import { goAddedThunk, goRemovedThunk, goTreeClosedThunk, goTreeOpenedThunk, goTreeSavedThunk, nodeFocusedThunk, nodeUnfocusedThunk } from "../thunks/go-tree-thunks";
import { componentsChangedThunk } from "../thunks/inspector-components-thunks";

type GameObjectState = (Omit<GameObject, "childs"> & {
    childs: string[]
});
export type NodeState = GameObjectState & {
    parent?: string,
    prefabRef?: string,
    isPrefab?: boolean,
    collapsed?: boolean
}
const nodeAdapter = createEntityAdapter<NodeState, string>({
    selectId: (node) => node.id
});
interface InitState{
    assetInfo?: AssetManager.AssetInfo,
    rootIds: string[],
    nodes: EntityState<NodeState, string>,
    allowAddRoot?: boolean,
    allowRemoveRoot?: boolean,
    opened?: boolean,
    modified: boolean,
    focusedId: string | null,
}
const initialState: InitState = {
    rootIds: [],
    nodes: nodeAdapter.getInitialState(),
    modified: false,
    focusedId: null,
};
const slice = createSlice({
    initialState,
    name: "go-tree",
    reducers: {
        renameGameObject: (state, action: PayloadAction<{ id: string, newName: string }>) => {
            const { id, newName } = action.payload;
            nodeAdapter.updateOne(state.nodes, { id, changes: { name: newName } });
            state.modified = true;
        },
        toggleCollapse: (state, action: PayloadAction<{ id: string }>) => {
            const { id } = action.payload;
            const node = state.nodes.entities[id];
            if(!node) return;
            node.collapsed = !node.collapsed;
        }
    },
    extraReducers(builder){
        builder.addCase(nodeFocusedThunk.fulfilled, (state, action) => {
            const { node } = action.meta.arg;
            let parentId = node.parent;
            while(parentId){
                const parent = state.nodes.entities[parentId];
                if(!parent) break;
                parent.collapsed = false;
                parentId = parent.parent;
            }
            state.focusedId = node.id;
        }),
        builder.addCase(nodeUnfocusedThunk.fulfilled, (state) => {
            state.focusedId = null;
        }),
        builder.addCase(goTreeOpenedThunk.fulfilled, (state, action) => {
            const { assetInfo, rootIds, nodes, allowAddRoot, allowRemoveRoot } = action.meta.arg;
            state.assetInfo = assetInfo;
            state.rootIds = rootIds;
            nodeAdapter.removeAll(state.nodes);
            nodeAdapter.addMany(state.nodes, nodes);
            state.allowAddRoot = allowAddRoot;
            state.allowRemoveRoot = allowRemoveRoot;
            state.modified = false;
            state.focusedId = null;
            state.opened = true;
        });
        builder.addCase(goTreeClosedThunk.fulfilled, (state) => {
            state.assetInfo = undefined;
            state.rootIds = [];
            nodeAdapter.removeAll(state.nodes);
            state.allowAddRoot = false;
            state.allowRemoveRoot = false;
            state.modified = false;
            state.focusedId = null;
            state.opened = false;
        });
        builder.addCase(goTreeSavedThunk.fulfilled, (state) => {
            state.modified = false;
        });
        builder.addCase(goAddedThunk.fulfilled, (state, action) => {
            const { nodeOut: node } = action.payload;
            if(!node.parent){
                state.rootIds.push(node.id);
            }
            else{
                const parent = state.nodes.entities[node.parent];
                if(!parent) return;
                parent.childs.push(node.id);
            }
            nodeAdapter.addOne(state.nodes, node);
            state.modified = true;
        });
        builder.addCase(goRemovedThunk.fulfilled, (state, action) => {
            const { node } = action.meta.arg;
            const { removeIds } = action.payload;
            if(!node.parent){
                state.rootIds = state.rootIds.filter(e => e !== node.id);
            }
            else{
                const parent = state.nodes.entities[node.parent];
                nodeAdapter.updateOne(state.nodes, {
                    id: parent.id,
                    changes: {
                        childs: parent.childs.filter(id => id !== node.id)
                    }
                });
            }
            nodeAdapter.removeMany(state.nodes, removeIds);
            state.modified = true;
        });
        builder.addCase(componentsChangedThunk.fulfilled, (state, action) => {
            const { id, components } = action.payload;
            nodeAdapter.updateOne(state.nodes, {
                id,
                changes: {
                    components
                }
            });
            state.modified = true;
        });
    }
});
export const {
    selectById: selectNodeById,
    selectEntities: selectNodeRecord,
    selectAll: selectNodes
} = nodeAdapter.getSelectors((state: RootState) => state.goTree.nodes);

export const { renameGameObject, toggleCollapse } = slice.actions;
export default slice.reducer;