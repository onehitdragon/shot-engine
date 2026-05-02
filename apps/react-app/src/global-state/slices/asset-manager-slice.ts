import { createEntityAdapter, createSelector, createSlice, type EntityState } from "@reduxjs/toolkit";
import { isAssetImage, type Assets } from "../../engine-zod";
import type { RootState } from "../store";
import { newSceneFileSaved } from "../thunks/scene-manager-thunks";
import { assetUpdatedThunk } from "../thunks/asset-manager-thunk";

interface AssetEntityState extends EntityState<Assets.MetaObject, string>{

}
const adapter = createEntityAdapter<Assets.MetaObject, string>({
    selectId: (entry) => entry.asset.guid
});
const initialState: AssetEntityState = adapter.getInitialState({

});
const slice = createSlice({
    initialState,
    name: "asset-manager",
    reducers: {
    },
    extraReducers(builder){
        builder.addCase(
            newSceneFileSaved,
            (state, action) => {
                const { savedPath, asset } = action.payload;
                const metaObject: Assets.MetaObject = { path: savedPath, asset };
                adapter.addOne(state, metaObject);
            }
        );
        builder.addCase(assetUpdatedThunk.fulfilled, (state, action) => {
            const { asset } = action.meta.arg;
            adapter.updateOne(state, { id: asset.guid, changes: { asset } });
        });
    }
});

export const {
  selectById: selectAssetByGuid,
  selectEntities: selectAssetRecord,
  selectAll: selectAssets
} = adapter.getSelectors((state: RootState) => state.assetManager);
export const selectAssetImages = createSelector(selectAssetRecord, (metaObjects) => {
    return Object.values(metaObjects).filter(metaObject => isAssetImage(metaObject.asset));
});
export const {} = slice.actions;
export default slice.reducer;
