import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { showInspector } from "../slices/inspector-slice"
import type { AssetManager, ImageAsset, MeshAsset, PrefabAsset } from "@shot-engine/types";

export const inspectAssetThunk = createAsyncThunk
<
    void,
    {
        assetInfo: AssetManager.AssetInfo
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspector/inspectAsset",
    async ({ assetInfo }, { dispatch }) => {
        if(assetInfo.type === "other"){
            dispatch(showInspector({ inspector: {
                type: "text",
                content: "this asset not support"
            } }));
            return;
        }
        if(assetInfo.type === "image"){
            const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "image");
            dispatch(showInspector({ inspector: {
                type: "image",
                assetInfo,
                imageAsset: asset as ImageAsset
            } }));
            return;
        }
        if(assetInfo.type === "mesh"){
            const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "mesh");
            dispatch(showInspector({ inspector: {
                type: "mesh",
                assetInfo,
                meshAsset: asset as MeshAsset
            } }));
            return;
        }
        if(assetInfo.type === "prefab"){
            const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "prefab");
            dispatch(showInspector({ inspector: {
                type: "prefab",
                assetInfo,
                prefabAsset: asset as PrefabAsset
            } }));
            return;
        }
    }
);
