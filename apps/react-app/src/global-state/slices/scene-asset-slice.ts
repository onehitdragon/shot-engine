import { createSlice } from "@reduxjs/toolkit";
import type { AssetManager, SceneAsset } from "@shot-engine/types";
import { sceneAssetOpenedThunk } from "../thunks/scene-asset-thunk";

const initialState: {
    assetInfo?: AssetManager.AssetInfo
    sceneAsset?: SceneAsset
} = {
}

const slice = createSlice({
    initialState,
    name: "scene-asset",
    reducers: {
        
    },
    extraReducers(builder){
        builder.addCase(sceneAssetOpenedThunk.fulfilled, (state, action) => {
            state.assetInfo = action.meta.arg.assetInfo;
            state.sceneAsset = action.meta.arg.sceneAsset;
        });
    }
})

export default slice.reducer;
