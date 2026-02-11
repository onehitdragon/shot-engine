import { v4 as uuidv4 } from 'uuid';
import { mat4 } from 'gl-matrix';
import { degrees, Euler } from '@math.gl/core';
import { createPhongShadingComponent } from './SceneNodeComponentHelper';
import type { Assets } from '../../../../engine-zod';

export function createEmptySceneNode(){
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
        childs: [],
    }

    return sceneNode;
}
export function createCubeSceneNode(){
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
