import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { addSceneNode, closeScene, openScene, removeSceneNode, selectSceneNodeRecord, selectSceneNodes, updateSceneModified, updateScenePath } from "../slices/scene-manager-slice";
import { addEntry, type FolderManager } from "../slices/folder-manager-slice";
import { createAssetScene, isAssetImage, isAssetMesh } from "../../engine-zod";
import { addAsset } from "../slices/asset-manager-slice";
import { reduceResoures, removeAllResource, selectResourceRecord, upsertManyResource, type ResourceManager } from "../slices/resource-manager-slice";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";
import { updateLoading } from "../slices/app-loading-slice";
import { loop } from "../../pages/main-page/helpers/scene-manager-helper/helper";
import { cloneDeep } from "lodash";

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
    void,
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
    async ({ scene, nodes }, { dispatch, getState }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await whenNewNodes(getState(), projectPaths, nodes);
            dispatch(upsertManyResource({ resources }));
            dispatch(openScene({ scene, nodes }));
        }
        catch(err){
            await window.api.showError(String(err));
        }
        finally{
            dispatch(updateLoading({ loading: false }));
        }
    }
);
export const closeSceneThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/closeScene",
    async (_, { dispatch, getState }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            dispatch(closeScene());
            dispatch(removeAllResource());
            WebglResourceManager.getInstance().deleteAll();
        }
        catch(err){
            await window.api.showError(String(err));
        }
        finally{
            dispatch(updateLoading({ loading: false }));
        }
    }
)
export const addSceneNodeThunk = createAsyncThunk
<
    void,
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
    async ({ nodeId, parentId, nodes }, { dispatch, getState }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await whenNewNodes(getState(), projectPaths, nodes);
            dispatch(upsertManyResource({ resources }));
            dispatch(addSceneNode({ nodeId, parentId, nodes }));
        }
        catch(err){
            await window.api.showError(String(err));
        }
        finally{
            dispatch(updateLoading({ loading: false }));
        }
    }
);
export const removeSceneNodeThunk = createAsyncThunk
<
    void,
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
    async ({ id }, { dispatch, getState }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const sceneNodeRecord = selectSceneNodeRecord(getState());
            const nodes: SceneFormat.SceneNode[] = [];
            const nodeIds: string[] = [];
            loop(id, sceneNodeRecord, (node) => {
                nodes.push(node);
                nodeIds.push(node.id);
            });

            dispatch(removeSceneNode({ id, nodeIds }));
            const reduceGuids = await whenDeleteNodes(getState(), nodes);
            dispatch(reduceResoures({ reduceGuids }));
        }
        catch(err){
            await window.api.showError(String(err));
        }
        finally{
            dispatch(updateLoading({ loading: false }));
        }
    }
);
async function whenNewNodes(
    state: RootState,
    projectPaths: FolderManager.ProjectPaths,
    nodes: SceneFormat.SceneNode[],
    onError?: (msg: string) => void 
){
    const resourceEntities = state.resourceManager.entities;
    const dirtyResourceMap = new Map<string, ResourceManager.Resource>();

    const assetEntities = state.assetManager.entities;
    const assetExist = (guid: string) => {
        if(assetEntities[guid]) return true;
        onError?.(`dont find asset with guid ${guid}`);
        return false;
    }

    for(const node of nodes){
        const { components } = node;
        for(const component of components){
            if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
                const { primitiveType: guid } = component;
                if(!assetExist(guid)) continue;
                let dirtyResource = dirtyResourceMap.get(guid);
                if(!dirtyResource){
                    const curResource = resourceEntities[guid];
                    if(curResource){
                        dirtyResource = cloneDeep(curResource);
                    }
                    else{
                        dirtyResource = {
                            guid,
                            fileName: `${guid}.mesh`,
                            usedCount: 0
                        }
                    }
                    dirtyResourceMap.set(dirtyResource.guid, dirtyResource);
                }
                dirtyResource.usedCount++;
            }
            else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
                const { guid } = component;
                if(!assetExist(guid)) continue;
                let dirtyResource = dirtyResourceMap.get(guid);
                if(!dirtyResource){
                    const curResource = resourceEntities[guid];
                    if(curResource){
                        dirtyResource = cloneDeep(curResource);
                    }
                    else{
                        dirtyResource = {
                            guid,
                            fileName: `${guid}.mesh`,
                            usedCount: 0
                        }
                    }
                    dirtyResourceMap.set(dirtyResource.guid, dirtyResource);
                }
                dirtyResource.usedCount++;
            }
            else if(component.type === "Shading"){
                // todo
            }
        }
    }

    const resources = Array.from(dirtyResourceMap.values());
    const resourceDirPath = projectPaths.resource;
    for(const resource of resources){
        const { guid } = resource;

        const curResource = resourceEntities[guid];
        if(curResource) continue;

        const metaObject = assetEntities[resource.guid];
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
async function whenDeleteNodes(
    state: RootState,
    nodes: SceneFormat.SceneNode[],
){
    const resourceRecord = selectResourceRecord(state);
    const countMap = new Map<string, number>();
    const reduceGuids: string[] = [];
    for(const node of nodes){
        const { components } = node;
        for(const component of components){
            if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
                const { primitiveType: guid } = component;

                const resource = resourceRecord[guid];
                if(!resource) continue;
                reduceGuids.push(guid);

                let count = countMap.get(guid) ?? 0;
                count++;
                countMap.set(guid, count);
                if(resource.usedCount === count){
                    WebglResourceManager.getInstance().deleteMesh(guid);
                }
            }
            else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
                const { guid } = component;

                const resource = resourceRecord[guid];
                if(!resource) continue;
                reduceGuids.push(guid);
                
                let count = countMap.get(guid) ?? 0;
                count++;
                countMap.set(guid, count);
                if(resource.usedCount === count){
                    WebglResourceManager.getInstance().deleteMesh(guid);
                }
            }
            else if(component.type === "Shading"){
                // todo
            }
        }
    }
    return reduceGuids;
}
