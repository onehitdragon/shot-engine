import { createEntityAdapter, createSlice, type EntityState, type WritableDraft } from "@reduxjs/toolkit";
import type { RootState } from "../store";
// import { componentRemovedThunk, componentUpdatedThunk, sceneClosedThunk, sceneNodeAddedThunk, sceneNodeRemovedThunk, sceneOpenedThunk, uniqueComponentAddedThunk } from "../thunks/scene-manager-thunks";

export namespace ResourceManager{
    export type Resource = {
        guid: string,
        path: string,
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
    },
    extraReducers(builder){
        // builder.addCase(sceneOpenedThunk.fulfilled, (state, action) => {
        //     const { resources } = action.payload;
        //     updateResources(state, resources);
        // });
        // builder.addCase(sceneClosedThunk.fulfilled, (state) => {
        //     adapter.removeAll(state);
        // });
        // builder.addCase(sceneNodeAddedThunk.fulfilled, (state, action) => {
        //     const { resources } = action.payload;
        //     updateResources(state, resources);
        // });
        // builder.addCase(sceneNodeRemovedThunk.fulfilled, (state, action) => {
        //     const { resources } = action.payload;
        //     updateResources(state, resources);
        // });
        // builder.addCase(uniqueComponentAddedThunk.fulfilled, (state, action) => {
        //     const { resources } = action.payload;
        //     updateResources(state, resources);
        // });
        // builder.addCase(componentRemovedThunk.fulfilled, (state, action) => {
        //     const { resources } = action.payload;
        //     updateResources(state, resources);
        // });
        // builder.addCase(componentUpdatedThunk.fulfilled, (state, action) => {
        //     const { resources } = action.payload;
        //     updateResources(state, resources);
        // });
    }
});
function updateResources(
    state: WritableDraft<ResourceEntityState>,
    updatedResources: ResourceManager.Resource[]
){
    const resourceRecord = state.entities;
    for(const updatedResource of updatedResources){
        if(updatedResource.usedCount <= 0){
            adapter.removeOne(state, updatedResource.guid);
            continue;
        }
        const curResource = resourceRecord[updatedResource.guid];
        if(!curResource){
            adapter.addOne(state, updatedResource);
        }
        else{
            adapter.updateOne(state, { id: updatedResource.guid, changes: updatedResource });
        }
    }
}
export const {
    selectById: selectResourceByGuid,
    selectEntities: selectResourceRecord,
    selectAll: selectResources
} = adapter.getSelectors((state: RootState) => state.resourceManager);
export const {  } = slice.actions;
export default slice.reducer;