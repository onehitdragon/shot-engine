import { v4 as uuidv4 } from 'uuid';
import { mat4 } from 'gl-matrix';
import { degrees, Euler } from '@math.gl/core';
import { createPhongShadingComponent } from './SceneNodeComponentHelper';
import type { Assets } from '../../../../engine-zod';
import { cloneDeep } from 'lodash';

export function createEmptySceneNode(parent: SceneFormat.SceneNode["parent"]){
    const transform: Components.Transform = {
        type: "Transform",
        id: uuidv4(),
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
    }
    const sceneNode: SceneFormat.SceneNode = {
        name: "EmptyNode",
        id: uuidv4(),
        components: [transform.id],
        parent,
        childs: [],
    }
    const components: Components.Component[] = [transform];

    return [sceneNode, components] as const;
}
export function createCubeSceneNode(parent: SceneFormat.SceneNode["parent"]){
    const transform: Components.Transform = {
        type: "Transform",
        id: uuidv4(),
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
    }
    const mesh: Components.Mesh = {
        id: uuidv4(),
        type: "Mesh",
        meshType: "PrimitiveMesh",
        primitiveType: "CUBE"
    }
    const shading: Components.Shading = {
        id: uuidv4(),
        type: "Shading",
        shaderType: "simple",
        transparent: false,
        culling: 'none'
    }
    const sceneNode: SceneFormat.SceneNode = {
        name: "CubeNode",
        id: uuidv4(),
        components: [transform.id, mesh.id, shading.id],
        parent,
        childs: [],
    }
    const components: Components.Component[] = [transform, mesh, shading];

    return [sceneNode, components] as const;
}
export function createAssimpPrefab(
    node: AssimpFormat.Node,
    meshAssets: Assets.AssetMesh[],
    parent: SceneFormat.SceneNode | null = null,
    result: PrefabFormat.Prefab = {
        nodeId: "",
        nodes: [],
        components: []
    }
): PrefabFormat.Prefab
{
    const { name, transformation, meshes: meshIndices, children } = node;

    const transformMat4 = mat4.clone(transformation);
    mat4.transpose(transformMat4, transformMat4);
    const translate = mat4.getTranslation([], transformMat4);
    const rotateQuat = mat4.getRotation([], transformMat4);
    const rotate = degrees(new Euler().fromQuaternion([...rotateQuat]));
    const scale = mat4.getScaling([], transformMat4);
    const transform: Components.Transform = {
        type: "Transform",
        id: uuidv4(),
        position: translate,
        rotation: rotate,
        scale: scale
    }

    const sceneNode: SceneFormat.SceneNode = {
        name,
        id: uuidv4(),
        components: [transform.id],
        parent: parent ? parent.id : null,
        childs: [],
    }

    if(parent) parent.childs.push(sceneNode.id);
    else result.nodeId = sceneNode.id;
    result.nodes.push(sceneNode);
    result.components.push(transform);

    if(meshIndices.length > 0){
        const guid = meshAssets[meshIndices[0]].guid;
        const mesh: Components.Mesh = {
            id: uuidv4(),
            type: "Mesh",
            meshType: "ImportMesh",
            guid
        }
        const shading: Components.Shading = createPhongShadingComponent();
        sceneNode.components.push(mesh.id, shading.id);
        result.components.push(mesh, shading);
    }
    for(const childNode of children){
        createAssimpPrefab(childNode, meshAssets, sceneNode, result);
    }
    return result;
}
export function renewPrefab(prefab: PrefabFormat.Prefab): PrefabFormat.Prefab{
    const newPrefab = cloneDeep(prefab);
    const { nodeId: oldTopId, nodes, components } = newPrefab;
    const idMap = new Map<string, string>(); // old -> new
    for(const node of nodes){
        const oldId = node.id;
        const newId = uuidv4();
        if(idMap.has(oldId)) throw "same id in prefab";
        idMap.set(oldId, newId);
        node.id = newId;
    }
    for(const component of components){
        const oldId = component.id;
        const newId = uuidv4();
        if(idMap.has(oldId)) throw "same id in prefab";
        idMap.set(oldId, newId);
        component.id = newId;
    }
    const newTopId = idMap.get(oldTopId);
    if(!newTopId) throw "dont find top Node";
    for(const node of nodes){
        if(node.parent){
            const newId = idMap.get(node.parent);
            if(!newId) throw "cant find parent Node";
            node.parent = newId;
        }

        const { childs } = node;
        node.childs = childs.map(child => {
            const newId = idMap.get(child);
            if(!newId) throw "cant find child Node";
            return newId;
        });

        const { components } = node;
        node.components = components.map(component => {
            const newId = idMap.get(component);
            if(!newId) throw "cant find component";
            return newId;
        });
    }
    return {
        nodeId: newTopId,
        nodes,
        components
    }
}
