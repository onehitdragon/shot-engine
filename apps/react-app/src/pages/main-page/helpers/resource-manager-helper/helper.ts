import { cloneDeep } from "lodash";
import { isAssetImage, isAssetMesh, type Assets } from "../../../../engine-zod";
import type { ResourceManager } from "../../../../global-state/slices/resource-manager-slice";
import { WebglResourceManager } from "./WebglResourceManager";

async function useResourceByGuid(
    guid: string,
    assetRecord: Record<string, Assets.MetaObject>,
    resourceRecord: Record<string, ResourceManager.Resource>,
    projectResourcePath: string
){
    const metaObject = assetRecord[guid];
    if(!metaObject) return null;

    const check = async (ext: string) => {
        let outResource: ResourceManager.Resource
        let curResource = resourceRecord[guid];
        if(curResource){
            outResource = curResource;
        }
        else{
            resourceRecord[guid] = {
                guid,
                path: await window.fsPath.join(projectResourcePath, `${guid}${ext}`),
                usedCount: 0
            };
            outResource = resourceRecord[guid];
        }
        outResource.usedCount++;
        return outResource;
    }

    const { asset } = metaObject;
    let resource: ResourceManager.Resource;
    if(isAssetMesh(asset)){
        resource = await check(".mesh");
    }
    else if(isAssetImage(asset)){
        resource = await check(".image");
    }
    else throw "asset invalid";

    const sourcePath = metaObject.path;
    const destPath = resource.path;
    const resourceExist = await window.api.file.exist(destPath);
    if(!resourceExist){
        if(isAssetMesh(asset)){
            const meshJson = await window.api.file.getText(sourcePath);
            const meshSource = JSON.parse(meshJson) as MeshFormat.Mesh;
            await window.api.resource.saveMesh(destPath, meshSource);
        }
        else if(isAssetImage(asset)){
            await window.api.resource.saveImage(destPath, sourcePath);
        }
    }

    if(isAssetMesh(asset)){
        const meshResource = await window.api.resource.loadMesh(destPath);
        WebglResourceManager.getInstance().updateMesh(guid, meshResource);
    }
    else if(isAssetImage(asset)){
        const imageResource = await window.api.resource.loadImage(destPath);
        WebglResourceManager.getInstance().updateTexture(guid, imageResource, asset.image);
    }

    return resource;
};
export async function useResourceByComponents(
    components: Components.Component[],
    assetRecord: Record<string, Assets.MetaObject>,
    resourceRecord: Record<string, ResourceManager.Resource>,
    projectResourcePath: string
){
    const guids: string[] = [];
    for(const component of components){
        if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
            guids.push(component.primitiveType);
        }
        else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
            guids.push(component.guid);
        }
        else if(component.type === "Shading" && component.shaderType === "phong"){
            guids.push(component.diffuseGuid, component.normalGuid);
        }
    }

    const resourceRecordClone = cloneDeep(resourceRecord); // todo: performance
    const resources: ResourceManager.Resource[] = [];
    for(const guid of guids){
        const resource = await useResourceByGuid(
            guid,
            assetRecord,
            resourceRecordClone,
            projectResourcePath
        );
        if(resource) resources.push(resource);
    }

    return resources;
}
function unuseResourceByGuid(
    guid: string,
    resourceRecord: Record<string, ResourceManager.Resource>
){
    let resource = resourceRecord[guid];
    if(!resource) return null;
    resource.usedCount--;

    if(resource.usedCount === 0){
        WebglResourceManager.getInstance().tryDelete(guid);
    }

    return resource;
};
export function unuseResourceByComponents(
    components: Components.Component[],
    resourceRecord: Record<string, ResourceManager.Resource>
){
    const guids: string[] = [];
    for(const component of components){
        if(component.type === "Mesh" && component.meshType === "PrimitiveMesh"){
            guids.push(component.primitiveType);
        }
        else if(component.type === "Mesh" && component.meshType === "ImportMesh"){
            guids.push(component.guid);
        }
        else if(component.type === "Shading" && component.shaderType === "phong"){
            guids.push(component.diffuseGuid, component.normalGuid);
        }
    }

    const resourceRecordClone = cloneDeep(resourceRecord); // todo: performance
    const resources: ResourceManager.Resource[] = [];
    for(const guid of guids){
        const resource = unuseResourceByGuid(
            guid,
            resourceRecordClone
        );
        if(resource) resources.push(resource);
    }

    return resources;
}
export async function updateResourceByComponent(
    curComponent: Components.Component,
    newComponent: Components.Component,
    assetRecord: Record<string, Assets.MetaObject>,
    resourceRecord: Record<string, ResourceManager.Resource>,
    projectResourcePath: string
){
    const oldGuids: string[] = [];
    const newGuids: string[] = [];
    if(curComponent.type === "Shading" && curComponent.shaderType === "phong"){
        newComponent = newComponent as typeof curComponent;
        const { diffuseGuid: curDiffuseGuid, normalGuid: curNormalGuid } = curComponent;
        const { diffuseGuid: newDiffuseGuid, normalGuid: newNormalGuid  } = newComponent;
        if(curDiffuseGuid !== newDiffuseGuid){
            oldGuids.push(curDiffuseGuid);
            newGuids.push(newDiffuseGuid);
        }
        if(curNormalGuid !== newNormalGuid){
            oldGuids.push(curNormalGuid);
            newGuids.push(newNormalGuid);
        }
    }

    const resourceRecordClone = cloneDeep(resourceRecord); // todo: performance
    const resources: ResourceManager.Resource[] = [];
    for(const guid of oldGuids){
        const resource = unuseResourceByGuid(
            guid,
            resourceRecordClone
        );
        if(resource) resources.push(resource);
    }
    for(const guid of newGuids){
        const resource = await useResourceByGuid(
            guid,
            assetRecord,
            resourceRecordClone,
            projectResourcePath
        );
        if(resource) resources.push(resource);   
    }

    return resources;
};
export async function updateResourceByAsset(
    asset: Assets.Asset,
    resourceRecord: Record<string, ResourceManager.Resource>,
){
    const { guid } = asset;
    const resource = resourceRecord[asset.guid];
    if(!resource) return;
    if(isAssetMesh(asset)){
        const meshResource = await window.api.resource.loadMesh(resource.path);
        WebglResourceManager.getInstance().updateMesh(guid, meshResource);
    }
    else if(isAssetImage(asset)){
        const imageResource = await window.api.resource.loadImage(resource.path);
        WebglResourceManager.getInstance().updateTexture(guid, imageResource, asset.image);
    }
}
