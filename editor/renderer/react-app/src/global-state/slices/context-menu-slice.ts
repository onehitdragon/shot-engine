import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SceneNodeContextMenu = {
    type: "scene-node",
    sceneNode: SceneFormat.SceneNode
}
export type ComponentContextMenu = {
    type: "component",
    sceneNode: SceneFormat.SceneNode,
    component: Components.Component
}
type State = {
    contextMenu: null | SceneNodeContextMenu | ComponentContextMenu,
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