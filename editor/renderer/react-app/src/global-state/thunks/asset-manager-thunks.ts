import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { removeManyAsset } from "../slices/asset-manager-slice";
import { removeManyResource } from "../slices/resource-manager-slice";
import { isAssetImage, isAssetMesh } from "../../engine-zod";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";

export const deleteManyAssetThunk = createAsyncThunk
<
    void,
    { guids: string[] },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/deleteManyAsset",
    async ({ guids }, { getState, dispatch }) => {
        const projectPaths = getState().folderManager.projectPaths;
        if(!projectPaths) throw "require a project is opening";

        const assetEntities = getState().assetManager.entities;
        const resourceEntities = getState().resourceManager.entities;
        for(const guid of guids){
            const asset = assetEntities[guid];
            const resource = resourceEntities[guid];
            if(!asset || !resource) continue;
            if(isAssetMesh(asset.asset)){
                WebglResourceManager.getInstance().deleteMesh(guid);
            }
            else if(isAssetImage(asset.asset)){
                WebglResourceManager.getInstance().deleteTexture(guid);
            }
        }

        dispatch(removeManyResource({ guids }));
        dispatch(removeManyAsset({ guids }));
    }
)