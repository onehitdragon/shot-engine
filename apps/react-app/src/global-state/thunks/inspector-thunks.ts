import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { showInspector } from "../slices/inspector-slice"
import type { AssetManager, ImageAsset, MeshAsset, PrefabAsset, SceneAsset } from "@shot-engine/types";

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
    async ({ assetInfo }, { dispatch, rejectWithValue }) => {
        try{
            if(assetInfo.type === "other"){
                dispatch(showInspector({ inspector: {
                    type: "text",
                    content: "this asset not support"
                } }));
                return;
            }
            if(assetInfo.type === "image"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "image");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "image",
                    assetInfo,
                    imageAsset: asset as ImageAsset
                } }));
                return;
            }
            if(assetInfo.type === "mesh"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "mesh");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "mesh",
                    assetInfo,
                    meshAsset: asset as MeshAsset
                } }));
                return;
            }
            if(assetInfo.type === "prefab"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "prefab");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "prefab",
                    assetInfo,
                    prefabAsset: asset as PrefabAsset
                } }));
                return;
            }
            if(assetInfo.type === "scene"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "scene");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "scene",
                    assetInfo,
                    sceneAsset: asset as SceneAsset
                } }));
                return;
            }
        }
        catch(err){
            await window.api.showError(String(err));
            rejectWithValue(err);
        }
    }
);
