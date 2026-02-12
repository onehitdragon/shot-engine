import { v4 as uuidv4 } from 'uuid';
import { mat4 } from 'gl-matrix';
import { degrees, Euler } from '@math.gl/core';
import { createPhongShadingComponent } from './SceneNodeComponentHelper';
import type { Assets } from '../../../../engine-zod';
import { cloneDeep } from 'lodash';

export function createEmptySceneNode(parent: SceneFormat.SceneNode["parent"]){
    const sceneNode: SceneFormat.SceneNode = {
        name: "EmptyNode",
        id: uuidv4(),
        components: [
            {
                type: "Transform",
                id: uuidv4(),
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            }
        ],
        parent,
        childs: [],
    }

    return sceneNode;
}
export function createCubeSceneNode(parent: SceneFormat.SceneNode["parent"]){
    const sceneNode: SceneFormat.SceneNode = {
        name: "CubeNode",
        id: uuidv4(),
        components: [
            {
                type: "Transform",
                id: uuidv4(),
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            },
            {
                id: uuidv4(),
                type: "Mesh",
                meshType: "PrimitiveMesh",
                primitiveType: "CUBE"
            },
            {
                id: uuidv4(),
                type: "Shading",
                shaderType: "simple",
                transparent: false,
                culling: 'none'
            }
        ],
        parent,
        childs: [],
    }

    return sceneNode;
}
export function createAssimpPrefab(
    node: AssimpFormat.Node,
    meshAssets: Assets.AssetMesh[],
    parent: SceneFormat.SceneNode | null = null,
    result: PrefabFormat.Prefab = {
        nodeId: "",
        nodes: []
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
    const sceneNode: SceneFormat.SceneNode = {
        name,
        id: uuidv4(),
        components: [
            {
                type: "Transform",
                id: uuidv4(),
                position: translate,
                rotation: rotate,
                scale: scale
            }
        ],
        parent: parent ? parent.id : null,
        childs: [],
    }

    if(parent) parent.childs.push(sceneNode.id);
    else result.nodeId = sceneNode.id;
    result.nodes.push(sceneNode);

    if(meshIndices.length > 0){
        const guid = meshAssets[meshIndices[0]].guid;
        sceneNode.components.push(
            {
                id: uuidv4(),
                type: "Mesh",
                meshType: "ImportMesh",
                guid
            },
            createPhongShadingComponent()
        );
    }
    for(const childNode of children){
        createAssimpPrefab(childNode, meshAssets, sceneNode, result);
    }
    return result;
}
export function renewPrefab(prefab: PrefabFormat.Prefab): PrefabFormat.Prefab{
    const newPrefab = cloneDeep(prefab);
    const { nodeId: oldTopId, nodes } = newPrefab;
    const idMap = new Map<string, string>(); // old -> new
    for(const node of nodes){
        const oldId = node.id;
        const newId = uuidv4();
        if(idMap.has(oldId)) throw "same id in prefab";
        idMap.set(oldId, newId);
        node.id = newId;
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
    }
    return {
        nodeId: newTopId,
        nodes
    }
}
