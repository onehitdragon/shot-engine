import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { showInspector } from "../slices/inspector-slice"
import { isAssetFile, isAssetFolder, isAssetImage, isAssetMesh, isAssetPrefab, isAssetScene } from "../../engine-zod"

export const inspectAssetThunk = createAsyncThunk
<
    void,
    {
        path: string
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspector/inspectAsset",
    async ({ path }, { dispatch }) => {
        if(path.endsWith(".meta.json")){
            const text = await window.api.file.getText(path);
            dispatch(showInspector({ inspector: {
                type: "text",
                content: text
            } }));
            return;
        }

        const metaPath = path + ".meta.json";
        const metaExist = await window.api.file.exist(metaPath);
        if(!metaExist){
            dispatch(showInspector({ inspector: {
                type: "text",
                content: `${metaPath} dont exist`
            } }));
            return;
        }

        const metaObject = JSON.parse(await window.api.file.getText(metaPath));
        if(isAssetFolder(metaObject)){
            dispatch(showInspector({ inspector: {
                type: "text",
                content: `This is Folder`
            } }));
            return;
        }
        else if(isAssetFile(metaObject)){
            const text = await window.api.file.getText(path);
            dispatch(showInspector({ inspector: {
                type: "text",
                content: text
            } }));
            return;
        }
        else if(isAssetImage(metaObject)){
            dispatch(showInspector({ inspector: {
                type: "asset",
                guid: metaObject["guid"],
                path,
                metaPath: metaPath
            } }));
            return;
        }
        else if(isAssetScene(metaObject)){
            const text = await window.api.file.getText(path);
            const jsonObject = JSON.parse(text) as Extract<Importer.JsonImportFile, { type: "scene" }>;
            dispatch(showInspector({ inspector: {
                type: "scene",
                path,
                scene: jsonObject.data.scene,
                nodes: jsonObject.data.nodes,
                components: jsonObject.data.components
            } }));
            return;
        }
        else if(isAssetMesh(metaObject)){
            const text = await window.api.file.getText(path);
            const jsonObject = JSON.parse(text) as MeshFormat.Mesh;
            dispatch(showInspector({ inspector: {
                type: "mesh",
                mesh: jsonObject
            } }));
            return;
        }
        else if(isAssetPrefab(metaObject)){
            const text = await window.api.file.getText(path);
            const jsonObject = JSON.parse(text) as PrefabFormat.Prefab;
            dispatch(showInspector({ inspector: {
                type: "prefab",
                prefab: jsonObject
            } }));
            return;
        }
    }
)