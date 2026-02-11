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

}
const adapter = createEntityAdapter<ResourceManager.Resource, string>({
    selectId: (entity) => entity.guid
});
const initialState: ResourceEntityState = adapter.getInitialState({

});
const slice = createSlice({
    initialState,
    name: "resource-manager",
    reducers: {
        recreate: (state, action: PayloadAction<{ resources: ResourceManager.Resource[] }>) => {
            adapter.removeAll(state);
            adapter.addMany(state, action.payload.resources);
        }
    }
});
export const {
} = adapter.getSelectors((state: RootState) => state.resourceManager);
export const { recreate } = slice.actions;
export default slice.reducer;