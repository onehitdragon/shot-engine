import { createAsyncThunk } from "@reduxjs/toolkit";
import { type Assets } from "../../engine-zod";
import type { AppDispatch, RootState } from "../store";
import { updateResourceByAsset } from "../../pages/main-page/helpers/resource-manager-helper/helper";

export const assetUpdatedThunk = createAsyncThunk
<
    void,
    {
        asset: Assets.Asset
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "asset/assetUpdated",
    async ({ asset }, { getState }) => {
        try{
            const assetRecord = getState().assetManager.entities;
            const curMetaObject = assetRecord[asset.guid];
            if(!curMetaObject) throw "cant find asset";
            await updateResourceByAsset(asset, getState().resourceManager.entities);
        }
        catch(err){
            await window.api.showError(String(err));
        }
    }
);