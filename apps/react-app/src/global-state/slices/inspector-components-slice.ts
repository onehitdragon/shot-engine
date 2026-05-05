import { createEntityAdapter, createSlice, type EntityState } from "@reduxjs/toolkit"
import type { Component } from "@shot-engine/types";
import { componentAddedThunk, componentRemovedThunk, componentsInpectedThunk, componentUpdatedThunk } from "../thunks/inspector-components-thunks";
import type { RootState } from "../store";

interface ComponentEntityState extends EntityState<Component, string>{
    id: string,
    allowModify: boolean
}
const adapter = createEntityAdapter<Component, string>({
    selectId: (c) => c.id
});
const initialState: ComponentEntityState = adapter.getInitialState({
    id: "",
    allowModify: false
});

const slice = createSlice({
    initialState,
    name: "inspector-components",
    reducers: {

    },
    extraReducers(builder){
        builder.addCase(componentsInpectedThunk.fulfilled, (state, action) => {
            const { componentOuts } = action.payload;
            const { id, allowModify } = action.meta.arg;
            state.id = id,
            adapter.removeAll(state);
            adapter.addMany(state, componentOuts);
            state.allowModify = allowModify;
        });
        builder.addCase(componentUpdatedThunk.fulfilled, (state, action) => {
            const { component } = action.meta.arg;
            adapter.updateOne(state, { id: component.id, changes: component });
        });
        builder.addCase(componentAddedThunk.fulfilled, (state, action) => {
            const { componentOut } = action.payload;
            adapter.addOne(state, componentOut);
        });
        builder.addCase(componentRemovedThunk.fulfilled, (state, action) => {
            const { component } = action.meta.arg;
            adapter.removeOne(state, component.id);
        });
    },
});

export const {
  selectById: selectComponentById,
  selectAll: selectComponents
} = adapter.getSelectors((state: RootState) => state.inspectorComponents);

export const { } = slice.actions;

export default slice.reducer;
