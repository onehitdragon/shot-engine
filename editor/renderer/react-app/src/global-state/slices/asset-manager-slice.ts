import { createEntityAdapter, createSelector, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import { isAssetImage, type Assets } from "../../engine-zod";
import type { RootState } from "../store";
import { newSceneFileSaved } from "../thunks/scene-manager-thunks";
import { fileImportedThunk, folderCreatedThunk, projectClosedThunk, projectOpenedThunk } from "../thunks/folder-manager-thunks";

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
        removeManyAsset: (state, action: PayloadAction<{ guids: string[] }>) => {
            adapter.removeMany(state, action.payload.guids);
        },
        updateAsset: (state, action: PayloadAction<{ metaObject: Assets.MetaObject }>) => {
            const { metaObject } = action.payload;
            adapter.updateOne(state, { id: metaObject.asset.guid, changes: metaObject });
        },
    },
    extraReducers(builder){
        builder.addCase(projectOpenedThunk.fulfilled, (state, action) => {
            const { metaObjects } = action.payload;
            adapter.removeAll(state);
            adapter.addMany(state, metaObjects);
        });
        builder.addCase(projectClosedThunk.fulfilled, (state) => {
            adapter.removeAll(state);
        });
        builder.addCase(folderCreatedThunk.fulfilled, (state, action) => {
            const { metaObject } = action.payload;
            adapter.addOne(state, metaObject);
        });
        builder.addCase(fileImportedThunk.fulfilled, (state, action) => {
            const { fbxImport, imageImport } = action.payload;
            if(fbxImport){
                const { fbxDirMetaObject, meshFiles, prefab } = fbxImport;
                adapter.addOne(state, fbxDirMetaObject);
                for(const { metaObject } of meshFiles){
                    adapter.addOne(state, metaObject);
                }
                adapter.addOne(state, prefab.metaObject);
            }
            if(imageImport){
                const { metaObject } = imageImport;
                adapter.addOne(state, metaObject);
            }
        });
        builder.addCase(
            newSceneFileSaved,
            (state, action) => {
                const { savedPath, asset } = action.payload;
                const metaObject: Assets.MetaObject = { path: savedPath, asset };
                adapter.addOne(state, metaObject);
            }
        );
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
export const { removeManyAsset, updateAsset } = slice.actions;
export default slice.reducer;
