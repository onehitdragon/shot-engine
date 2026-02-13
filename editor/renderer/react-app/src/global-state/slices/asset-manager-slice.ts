import { createEntityAdapter, createSelector, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import { isAssetImage, type Assets } from "../../engine-zod";
import type { RootState } from "../store";

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
        recreate: (state, action: PayloadAction<{ metaObjects: Assets.MetaObject[] }>) => {
            adapter.removeAll(state);
            adapter.addMany(state, action.payload.metaObjects);
        },
        addAsset: (state, action: PayloadAction<{ metaObject: Assets.MetaObject }>) => {
            adapter.addOne(state, action.payload.metaObject);
        },
        removeManyAsset: (state, action: PayloadAction<{ guids: string[] }>) => {
            adapter.removeMany(state, action.payload.guids);
        },
        updateAsset: (state, action: PayloadAction<{ metaObject: Assets.MetaObject }>) => {
            const { metaObject } = action.payload;
            adapter.updateOne(state, { id: metaObject.asset.guid, changes: metaObject });
        },
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
export const { recreate, addAsset, removeManyAsset, updateAsset } = slice.actions;
export default slice.reducer;
