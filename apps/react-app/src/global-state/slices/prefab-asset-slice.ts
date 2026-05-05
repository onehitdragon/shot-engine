import { createSlice } from "@reduxjs/toolkit";
import type { AssetManager } from "@shot-engine/types";
import { prefabAssetOpenedThunk } from "../thunks/prefab-asset-thunk";

const initialState: {
    assetInfo: AssetManager.AssetInfo | null
} = {
    assetInfo: null
}

const slice = createSlice({
    initialState,
    name: "prefab-asset",
    reducers: {

    },
    extraReducers(builder){
        builder.addCase(prefabAssetOpenedThunk.fulfilled, (state, action) => {
            state.assetInfo = action.meta.arg.assetInfo;
        });
    }
})

export default slice.reducer;
