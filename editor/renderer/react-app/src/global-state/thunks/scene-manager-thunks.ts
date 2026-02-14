import { createAction, createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { addSceneNode, closeScene, removeSceneNode, selectComponents, selectSceneNodeRecord, selectSceneNodes } from "../slices/scene-manager-slice";
import { type FolderManager } from "../slices/folder-manager-slice";
import { createAssetScene, isAssetImage, isAssetMesh, type Assets } from "../../engine-zod";
import { reduceResoures, removeAllResource, selectResourceRecord, upsertManyResource, type ResourceManager } from "../slices/resource-manager-slice";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";
import { updateLoading } from "../slices/app-loading-slice";
import { loop } from "../../pages/main-page/helpers/scene-manager-helper/helper";
import { cloneDeep } from "lodash";

export const newSceneFileSaved = createAction<{
    savedDir: string,
    savedPath: string,
    sceneSaved: DirectoryTree.File,
    metaSaved: DirectoryTree.File,
    asset: Assets.Asset
}>("scene/newSceneFileSaved");
export const sceneSavedThunk = createAsyncThunk
<
    {
        savedPath: string
    },
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene/sceneSaved",
    async (_, { getState, dispatch, rejectWithValue }) => {
        try{
            const { scene, modified } = getState().sceneManager;
            if(!scene || !modified) throw "error while saving";
            let savedPath = getState().sceneManager.path;
            const jsonImportFile: Importer.JsonImportFile = {
                type: "scene",
                data: {
                    scene,
                    nodes: selectSceneNodes(getState()),
                    components: selectComponents(getState())
                }
            }
            const json = JSON.stringify(jsonImportFile, null, 2);
            if(!savedPath){
                const openedPath = await window.api.file.openSave(scene.name + ".scene.json", json);
                if(!openedPath) throw "error while saving";
                savedPath = openedPath;

                const savedDir = await window.fsPath.dirname(savedPath);
                const savedName = await window.fsPath.basename(savedPath);
                const sceneSaved: DirectoryTree.File = {
                    type: "File",
                    name: savedName,
                    path: savedPath
                }

                const metaName = savedName + ".meta.json";
                const metaPath = savedPath + ".meta.json";
                const asset = createAssetScene();
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaSaved: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                }

                dispatch(newSceneFileSaved({ savedDir, savedPath, sceneSaved, metaSaved, asset }));
            }
            else{
                await window.api.file.save(savedPath, json);
            }
            return { savedPath };
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const sceneOpenedThunk = createAsyncThunk
<
    void,
    {
        scene: SceneFormat.Scene,
        nodes: SceneFormat.SceneNode[],
        components: Components.Component[],
        path: string | null,
        modified: boolean
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/sceneOpened",
    async ({ nodes, components }, { dispatch, getState }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await whenNewNodes(getState(), projectPaths, nodes);
            dispatch(upsertManyResource({ resources }));
        }
        catch(err){
            await window.api.showError(String(err));
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
        nodes: SceneFormat.SceneNode[],
        components: Components.Component[]
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene-manager/addSceneNode",
    async ({ nodeId, parentId, nodes, components }, { dispatch, getState }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await whenNewNodes(getState(), projectPaths, nodes);
            dispatch(upsertManyResource({ resources }));
            dispatch(addSceneNode({ nodeId, parentId, nodes, components }));
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
            const componentIds: string[] = [];
            loop(id, sceneNodeRecord, (node) => {
                nodes.push(node);
                nodeIds.push(node.id);
                componentIds.push(...node.components);
            });

            dispatch(removeSceneNode({ id, nodeIds, componentIds }));
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
// export const updateComponentOfSceneNodeThunk = createAsyncThunk
// <
//     void,
//     {
//         nodeId: string,
//         component: Components.Component
//     },
//     {
//         dispatch: AppDispatch,
//         state: RootState
//     }
// >
// (
//     "scene-manager/updateComponentOfSceneNode",
//     async ({ nodeId, component }, { getState, dispatch }) => {
//         try{
//             dispatch(updateLoading({ loading: true }));
//             const projectPaths = getState().folderManager.projectPaths;
//             if(!projectPaths) throw "require a project opening";

//             const node = getState().sceneManager.entities[nodeId];
//             if(!node) return;
//             const oldComponent = node.components.find(c => c.id === component.id);
//             if(!oldComponent) return;
//             if(oldComponent.type === "Shading" && oldComponent.shaderType === "phong"){

//             }

//             const resources = await whenNewNodes(getState(), projectPaths, nodes);
//             dispatch(upsertManyResource({ resources }));
//             dispatch();
//         }
//         catch(err){
//             await window.api.showError(String(err));
//         }
//         finally{
//             dispatch(updateLoading({ loading: false }));
//         }
//     }
// )
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
    const check = (guid: string, ext: string) => {
        if(!assetExist(guid)) return;
        let dirtyResource = dirtyResourceMap.get(guid);
        if(!dirtyResource){
            const curResource = resourceEntities[guid];
            if(curResource){
                dirtyResource = cloneDeep(curResource);
            }
            else{
                dirtyResource = {
                    guid,
                    fileName: `${guid}${ext}`,
                    usedCount: 0
                }
            }
            dirtyResourceMap.set(dirtyResource.guid, dirtyResource);
        }
        dirtyResource.usedCount++;
    }

    for(const node of nodes){
        const { components } = node;
        for(const component of components){
            if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
                const { primitiveType: guid } = component;
                check(guid, ".mesh");
            }
            else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
                const { guid } = component;
                check(guid, ".mesh");
            }
            else if(component.type === "Shading" && component.shaderType === "phong"){
                const { diffuseGuid, normalGuid } = component;
                check(diffuseGuid, ".image");
                check(normalGuid, ".image");
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
                const imagePath = metaObject.path;
                await window.api.resource.saveImage(resourcePath, imagePath);
            }
        }

        if(isAssetMesh(metaObject.asset)){
            const meshResource = await window.api.resource.loadMesh(resourcePath);
            WebglResourceManager.getInstance().updateMesh(resource.guid, meshResource);
        }
        else if(isAssetImage(metaObject.asset)){
            const imageResource = await window.api.resource.loadImage(resourcePath);
            WebglResourceManager.getInstance().updateTexture(resource.guid, imageResource, metaObject.asset.image);
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
    
    const checkGuid = (guid: string, onDelete: () => void) => {
        const resource = resourceRecord[guid];
        if(!resource) return;
        reduceGuids.push(guid);

        let count = countMap.get(guid) ?? 0;
        count++;
        countMap.set(guid, count);
        if(resource.usedCount === count){
            onDelete();
        }
    }

    for(const node of nodes){
        const { components } = node;
        for(const component of components){
            if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
                const { primitiveType: guid } = component;
                checkGuid(guid, () => {
                    WebglResourceManager.getInstance().deleteMesh(guid);
                });
            }
            else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
                const { guid } = component;
                checkGuid(guid, () => {
                    WebglResourceManager.getInstance().deleteMesh(guid);
                });
            }
            else if(component.type === "Shading" && component.shaderType === "phong"){
                const { diffuseGuid, normalGuid } = component;
                checkGuid(diffuseGuid, () => {
                    WebglResourceManager.getInstance().deleteTexture(diffuseGuid);
                });
                checkGuid(normalGuid, () => {
                    WebglResourceManager.getInstance().deleteTexture(normalGuid);
                });
            }
        }
    }
    return reduceGuids;
}
async function whenUpdateComponent(
    oldComponent: Components.Component,
    newComponent: Components.Component
){
    
}
