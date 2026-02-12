import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { selectSceneNodeRecord, selectSceneNodes, updateSceneModified, updateScenePath } from "../slices/scene-manager-slice";
import { addEntry, type FolderManager } from "../slices/folder-manager-slice";
import { createAssetScene, isAssetImage, isAssetMesh } from "../../engine-zod";
import { addAsset } from "../slices/asset-manager-slice";
import { addManyResource, recreate, reduceResoures, selectResourceRecord, updateStatus, type ResourceManager } from "../slices/resource-manager-slice";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";
import { updateLoading } from "../slices/app-loading-slice";
import { loop } from "../../pages/main-page/helpers/scene-manager-helper/helper";

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
export const openSceneThunk = createAsyncThunk
<
    {
        scene: SceneFormat.Scene,
        nodes: SceneFormat.SceneNode[]
    },
    {
        scene: SceneFormat.Scene,
        nodes: SceneFormat.SceneNode[]
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/openScene",
    async ({ scene, nodes }, { dispatch, getState, rejectWithValue }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            dispatch(updateStatus({ status: "loading" }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await whenNewNodes(getState(), projectPaths, nodes);
            dispatch(recreate({ resources }));
            
            return {
                scene,
                nodes
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
        finally{
            dispatch(updateStatus({ status: "stable" }));
            dispatch(updateLoading({ loading: false }));
        }
    }
);
export const addSceneNodeThunk = createAsyncThunk
<
    {
        nodeId: string,
        parentId: SceneFormat.SceneNode["parent"]
        nodes: SceneFormat.SceneNode[]
    },
    {
        nodeId: string,
        parentId: SceneFormat.SceneNode["parent"]
        nodes: SceneFormat.SceneNode[]
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/addSceneNode",
    async ({ nodeId, parentId, nodes }, { dispatch, getState, rejectWithValue }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            dispatch(updateStatus({ status: "loading" }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await whenNewNodes(getState(), projectPaths, nodes);
            dispatch(addManyResource({ resources }));
            
            return {
                nodeId,
                parentId,
                nodes
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
        finally{
            dispatch(updateStatus({ status: "stable" }));
            dispatch(updateLoading({ loading: false }));
        }
    }
);
export const removeSceneNodeThunk = createAsyncThunk
<
    {
        id: string,
        nodeIds: string[]
    },
    {
        id: string
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/removeSceneNode",
    async ({ id }, { dispatch, getState, rejectWithValue }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            dispatch(updateStatus({ status: "loading" }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const sceneNodeRecord = selectSceneNodeRecord(getState());
            const nodes: SceneFormat.SceneNode[] = [];
            const nodeIds: string[] = [];
            loop(id, sceneNodeRecord, (node) => {
                nodes.push(node);
                nodeIds.push(node.id);
            });

            const resourceRecord = selectResourceRecord(getState());
            const reduceGuids: string[] = [];
            for(const node of nodes){
                const { components } = node;
                for(const component of components){
                    if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
                        const { primitiveType: guid } = component;
                        const resource = resourceRecord[guid];
                        if(!resource) continue;
                        reduceGuids.push(guid);
                    }
                    else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
                        const { guid } = component;
                        const resource = resourceRecord[guid];
                        if(!resource) continue;
                        reduceGuids.push(guid);
                    }
                    else if(component.type === "Shading"){
                        // todo
                    }
                }
            }
            dispatch(reduceResoures({ reduceGuids }));
            
            return {
                id,
                nodeIds
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
        finally{
            dispatch(updateStatus({ status: "stable" }));
            dispatch(updateLoading({ loading: false }));
        }
    }
);
async function whenNewNodes(
    state: RootState,
    projectPaths: FolderManager.ProjectPaths,
    nodes: SceneFormat.SceneNode[],
){
    const resourceMap = new Map<string, ResourceManager.Resource>();
    for(const node of nodes){
        const { components } = node;
        for(const component of components){
            if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
                const { primitiveType } = component;
                const resource = resourceMap.get(primitiveType);
                if(!resource){
                    resourceMap.set(
                        primitiveType,
                        {
                            guid: primitiveType,
                            fileName: `${primitiveType}.mesh`,
                            usedCount: 1
                        }
                    );
                }
                else{
                    resource.usedCount++;
                }
            }
            else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
                const { guid } = component;
                const resource = resourceMap.get(guid);
                if(!resource){
                    resourceMap.set(
                        guid,
                        {
                            guid,
                            fileName: `${guid}.mesh`,
                            usedCount: 1
                        }
                    );
                }
                else{
                    resource.usedCount++;
                }
            }
            else if(component.type === "Shading"){
                // todo
            }
        }
    }

    const resources = Array.from(resourceMap.values());
    const resourceDirPath = projectPaths.resource;
    const assetEntities = state.assetManager.entities;
    for(const resource of resources){
        const metaObject = assetEntities[resource.guid];
        if(!metaObject) throw `Dont find metaObject ${resource.guid}`;

        const resourcePath = await window.fsPath.join(resourceDirPath, resource.fileName);
        const resourceExist = await window.api.file.exist(resourcePath);
        if(!resourceExist){
            if(isAssetMesh(metaObject.asset)){
                const meshJson = await window.api.file.getText(metaObject.path);
                const meshSource = JSON.parse(meshJson) as MeshFormat.Mesh;
                await window.api.resource.saveMesh(resourcePath, meshSource);
            }
            else if(isAssetImage(metaObject.asset)){
                // todo
            }
        }

        if(isAssetMesh(metaObject.asset)){
            const meshResource = await window.api.resource.loadMesh(resourcePath);
            WebglResourceManager.getInstance().updateMesh(resource.guid, meshResource);
        }
        else if(isAssetImage(metaObject.asset)){
            // todo
        }
    }

    return resources;
}
