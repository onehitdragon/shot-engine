import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { selectSceneNodes, updateSceneModified, updateScenePath } from "../slices/scene-manager-slice";
import { addEntry } from "../slices/folder-manager-slice";
import { createAssetScene } from "../../engine-zod";
import { addAsset } from "../slices/asset-manager-slice";

export const saveSceneThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/saveScene",
    async (_, { getState, dispatch }) => {
        const { scene, path, modified } = getState().sceneManager;
        if(!scene || !modified) return;
        const jsonImportFile: Importer.JsonImportFile = {
            type: "scene",
            data: {
                scene,
                nodes: selectSceneNodes(getState())
            }
        }
        const json = JSON.stringify(jsonImportFile, null, 2);
        if(!path){
            const savedPath = await window.api.file.openSave(scene.name + ".scene.json", json);
            if(!savedPath) return;
            dispatch(updateScenePath({ path: savedPath }));

            const savedDir = await window.fsPath.dirname(savedPath);
            const savedName = await window.fsPath.basename(savedPath);
            const saved: DirectoryTree.File = {
                type: "File",
                name: savedName,
                path: savedPath
            }
            dispatch(addEntry({ parentPath: savedDir, entry: saved }));

            const metaName = savedName + ".meta.json";
            const metaPath = savedPath + ".meta.json";
            const asset = createAssetScene();
            await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
            const metaCreated: DirectoryTree.File = {
                type: "File",
                name: metaName,
                path: metaPath
            }
            dispatch(addEntry({ parentPath: savedDir, entry: metaCreated }));
            dispatch(addAsset({ metaObject: { path: savedPath, asset } }));
        }
        else{
            await window.api.file.save(path, json);
        }
        dispatch(updateSceneModified({ value: false }));
    }
);
