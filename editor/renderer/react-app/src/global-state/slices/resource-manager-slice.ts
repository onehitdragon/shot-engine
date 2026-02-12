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
        },
        reduceResoures: (state, action: PayloadAction<{ reduceGuids: string[] }>) => {
            const { reduceGuids } = action.payload;
            const deleteGuids: string[] = [];
            for(const guid of reduceGuids){
                const resource = state.entities[guid];
                if (!resource) continue;
                resource.usedCount--;
                if(resource.usedCount <= 0){
                    deleteGuids.push(guid);
                }
            }
            adapter.removeMany(state, deleteGuids);
        }
    }
});
export const {
    selectById: selectResourceByGuid,
    selectEntities: selectResourceRecord,
    selectAll: selectResources
} = adapter.getSelectors((state: RootState) => state.resourceManager);
export const { updateStatus, recreate, addManyResource, reduceResoures } = slice.actions;
export default slice.reducer;