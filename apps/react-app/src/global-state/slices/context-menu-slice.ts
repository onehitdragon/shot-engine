import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Component } from "@shot-engine/types";
import type { NodeState } from "./go-tree-slice";

export type NodeContextMenu = {
    type: "node",
    node: NodeState
}
export type ComponentContextMenu = {
    type: "component",
    component: Component
}
type State = {
    contextMenu: null | NodeContextMenu | ComponentContextMenu,
    mousePos: { x: number, y: number }
};
const initialState: State = {
    contextMenu: null,
    mousePos: { x: 0, y: 0 }
}
const slice = createSlice({
    initialState,
    name: "context-menu",
    reducers: {
        openContextMenu: ((
            state,
            action: PayloadAction<{ contextMenu: State["contextMenu"], mousePos: State["mousePos"] }>
        ) => {
            state.contextMenu = action.payload.contextMenu;
            state.mousePos = action.payload.mousePos;
        }),
        closeContextMenu: (state) => {
            state.contextMenu = null;
        }
    }
});
export const { openContextMenu, closeContextMenu } = slice.actions;
export default slice.reducer;