import { isAssetImage, isAssetMesh } from "../../engine-zod";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";
import type { AppStartListening } from "../listenerMiddleware";
import type { FolderManager } from "../slices/folder-manager-slice";
import { addManyResource, recreate, updateStatus, type ResourceManager } from "../slices/resource-manager-slice";
import { addSceneNodeChild, updateScene } from "../slices/scene-manager-slice";
import type { RootState } from "../store";

export const addSceneManegerListener = (startAppListening: AppStartListening) => {
    startAppListening({
        actionCreator: updateScene,
        effect: async (action, { getState, dispatch }) => {
            dispatch(updateStatus({ status: "loading" }));
            try{
                const projectPaths = getState().folderManager.projectPaths;
                if(!projectPaths) throw "require a project opening";

                const { nodes } = action.payload;
                const resources = await whenNewNodes(getState(), projectPaths, nodes);
                dispatch(recreate({ resources }));
            }
            catch(err){
                await window.api.showError(String(err));
            }
            finally{
                dispatch(updateStatus({ status: "stable" }));
            }
        }
    });
    startAppListening({
        actionCreator: addSceneNodeChild,
        effect: async (action, { getState, dispatch }) => {
            dispatch(updateStatus({ status: "loading" }));
            try{
                const projectPaths = getState().folderManager.projectPaths;
                if(!projectPaths) throw "require a project opening";

                const { child } = action.payload;
                const resources = await whenNewNodes(getState(), projectPaths, [child]);
                dispatch(addManyResource({ resources }));
            }
            catch(err){
                await window.api.showError(String(err));
            }
            finally{
                dispatch(updateStatus({ status: "stable" }));
            }
        }
    });
};
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
