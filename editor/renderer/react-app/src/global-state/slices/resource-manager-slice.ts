import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export namespace ResourceManager{
    export type Resource = {
        guid: string,
        fileName: string,
        usedCount: number
    };
}
interface ResourceEntityState extends EntityState<ResourceManager.Resource, string>{
    status: "stable" | "loading"
}
const adapter = createEntityAdapter<ResourceManager.Resource, string>({
    selectId: (entity) => entity.guid
});
const initialState: ResourceEntityState = adapter.getInitialState({
    status: "stable"
});
const slice = createSlice({
    initialState,
    name: "resource-manager",
    reducers: {
        updateStatus: (state, action: PayloadAction<{ status: ResourceEntityState["status"] }>) => {
            state.status = action.payload.status;
        },
        recreate: (state, action: PayloadAction<{ resources: ResourceManager.Resource[] }>) => {
            adapter.removeAll(state);
            adapter.addMany(state, action.payload.resources);
        },
        addManyResource: (state, action: PayloadAction<{ resources: ResourceManager.Resource[] }>) => {
            adapter.addMany(state, action.payload.resources);
        }
    }
});
export const {
} = adapter.getSelectors((state: RootState) => state.resourceManager);
export const { updateStatus, recreate, addManyResource } = slice.actions;
export default slice.reducer;