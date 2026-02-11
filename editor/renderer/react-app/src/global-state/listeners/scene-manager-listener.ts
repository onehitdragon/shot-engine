import { isAssetImage, isAssetMesh } from "../../engine-zod";
import { WebglResourceManager } from "../../pages/main-page/helpers/resource-manager-helper/WebglResourceManager";
import type { AppStartListening } from "../listenerMiddleware";
import { recreate, type ResourceManager } from "../slices/resource-manager-slice";
import { updateScene } from "../slices/scene-manager-slice";

export const addSceneManegerListener = (startAppListening: AppStartListening) => {
    startAppListening({
        actionCreator: updateScene,
        effect: async (action, { getState, dispatch }) => {
            try{
                const projectPath = getState().folderManager.projectPath;
                if(!projectPath) throw "require a project opening";

                const { nodes } = action.payload;
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
                const resourceDirPath = await window.fsPath.join(projectPath, "Library", "Resource");
                const assetEntities = getState().assetManager.entities;
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

                dispatch(recreate({ resources }));
            }
            catch(err){
                await window.api.showError(String(err));
            }
        }
    });
};