import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assetChanged: 0
}
const slice = createSlice({
  initialState,
  name: "asset-cache",
  reducers: {
    emitAssetChanged: (state) => {
      state.assetChanged++;
    }
  }
});

export const { emitAssetChanged } = slice.actions;
export const assetCacheReducer = slice.reducer;
