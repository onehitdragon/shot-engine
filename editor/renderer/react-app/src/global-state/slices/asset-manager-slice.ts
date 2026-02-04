import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import type { Assets } from "../../engine-zod";
import type { RootState } from "../store";

interface AssetEntityState extends EntityState<Assets.Asset, string>{

}
const adapter = createEntityAdapter<Assets.Asset, string>({
    selectId: (entry) => entry.guid
});
const initialState: AssetEntityState = adapter.getInitialState({

});
const slice = createSlice({
    initialState,
    name: "asset-manager",
    reducers: {
        recreate: (state, action: PayloadAction<{ assets: Assets.Asset[] }>) => {
            adapter.removeAll(state);
            adapter.addMany(state, action.payload.assets);
        },
        addAsset: (state, action: PayloadAction<{ asset: Assets.Asset }>) => {
            adapter.addOne(state, action.payload.asset);
        },
        deleteAsset: (state, action: PayloadAction<{ guid: string }>) => {
            adapter.removeOne(state, action.payload.guid);
        }
    }
});

export const {
  selectById: selectAssetByGuid
} = adapter.getSelectors((state: RootState) => state.assetManager);
export const { recreate, addAsset, deleteAsset } = slice.actions;
export default slice.reducer;
