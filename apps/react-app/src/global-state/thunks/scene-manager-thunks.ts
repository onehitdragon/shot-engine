import { createAction, createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { selectComponents, selectSceneNodes } from "../slices/scene-manager-slice";
import { createAssetScene, type Assets } from "../../engine-zod";
import { type ResourceManager } from "../slices/resource-manager-slice";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";
import { loop } from "../../pages/main-page/helpers/scene-manager-helper/helper";
import { unuseResourceByComponents, updateResourceByComponent, useResourceByComponents } from "../../pages/main-page/helpers/resource-manager-helper/helper";

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
    {
        resources: ResourceManager.Resource[]
    },
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
    "scene/sceneOpened",
    async ({ components }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await useResourceByComponents(
                components,
                getState().assetManager.entities,
                getState().resourceManager.entities,
                projectPaths.resource
            );

            return {
                resources
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const sceneClosedThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene/sceneClosed",
    async (_, { getState }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";
            WebglResourceManager.getInstance().deleteAll();
        }
        catch(err){
            await window.api.showError(String(err));
        }
    }
)
export const sceneNodeAddedThunk = createAsyncThunk
<
    {
        resources: ResourceManager.Resource[]
    },
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
    "scene/sceneNodeAdded",
    async ({ components }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const resources = await useResourceByComponents(
                components,
                getState().assetManager.entities,
                getState().resourceManager.entities,
                projectPaths.resource
            );

            return { resources }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const sceneNodeRemovedThunk = createAsyncThunk
<
    {
        nodeIds: string[],
        componentIds: string[],
        resources: ResourceManager.Resource[]
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
    "scene/sceneNodeRemoved",
    async ({ id }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const sceneNodeRecord = getState().sceneManager.nodes.entities;
            const componentRecord = getState().sceneManager.components.entities;
            const nodeIds: string[] = [];
            const componentIds: string[] = [];
            const components: Components.Component[] = [];
            loop(id, sceneNodeRecord, (node) => {
                nodeIds.push(node.id);
                for(const componentId of node.components){
                    componentIds.push(componentId);
                    components.push(componentRecord[componentId]);
                }
            });

            const resources = unuseResourceByComponents(
                components,
                getState().resourceManager.entities
            );

            return {
                nodeIds,
                componentIds,
                resources
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const uniqueComponentAddedThunk = createAsyncThunk
<
    {
        resources: ResourceManager.Resource[]
    },
    {
        nodeId: string,
        component: Components.Component
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene/uniqueComponentAdded",
    async ({ nodeId, component }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const sceneNodeRecord = getState().sceneManager.nodes.entities;
            const node = sceneNodeRecord[nodeId];
            if(!node) throw "cant find node";

            const componentRecord = getState().sceneManager.components.entities;
            if(componentRecord[component.id]) throw "componentId existed";
            node.components.forEach((componentId) => {
                const curComponent = componentRecord[componentId];
                if(!curComponent) throw "missing component in node";
                if(curComponent.type === component.type) throw "component will be duplicated";
            });

            const resources = await useResourceByComponents(
                [component],
                getState().assetManager.entities,
                getState().resourceManager.entities,
                projectPaths.resource
            );

            return { resources };
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const componentRemovedThunk = createAsyncThunk
<
    {
        resources: ResourceManager.Resource[]
    },
    {
        nodeId: string,
        componentId: string
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene/componentRemoved",
    async ({ nodeId, componentId }, { getState, rejectWithValue }) => {
        try{
            const sceneNodeRecord = getState().sceneManager.nodes.entities;
            const node = sceneNodeRecord[nodeId];
            if(!node) throw "cant find node";

            const componentRecord = getState().sceneManager.components.entities;
            const curComponent = componentRecord[componentId];
            if(!curComponent) throw "cant find component";

            const { type } = curComponent;
            if(type === "Transform" || type === "Mesh") throw "cant delete this component";

            const resources = unuseResourceByComponents(
                [curComponent],
                getState().resourceManager.entities
            );

            return { resources };
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const componentUpdatedThunk = createAsyncThunk
<
    {
        resources: ResourceManager.Resource[]
    },
    {
        component: Components.Component
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "scene/componentUpdated",
    async ({ component }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "require a project opening";

            const componentRecord = getState().sceneManager.components.entities;
            const curComponent = componentRecord[component.id];
            if(!curComponent) throw "cant find current component";
            if(curComponent.type !== component.type) throw "component have different type";

            const resources = await updateResourceByComponent(
                curComponent,
                component,
                getState().assetManager.entities,
                getState().resourceManager.entities,
                projectPaths.resource
            );

            return { resources };
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
