import { v4 as uuidv4 } from 'uuid';
import { cubeMeshData, PRIMITIVE_MESH_ID } from './mesh-datas';
import { mat4 } from 'gl-matrix';
import { degrees, Euler } from '@math.gl/core';
import type { AppDispatch } from '../../../global-state/store';
import { addMesh } from '../../../global-state/slices/scene-manager-slice';

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
export function createCubeSceneNode(dispatch: AppDispatch){
    dispatch(addMesh({ mesh: cubeMeshData }));
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
                type: "Mesh",
                id: uuidv4(),
                meshId: PRIMITIVE_MESH_ID.CUBE
            },
            {
                id: uuidv4(),
                type: "Shading",
                shaderType: "simple"
            }
        ],
        childs: [],
    }

    return sceneNode;
}
export function createAssimpSceneNode(
    node: AssimpFormat.Node,
    meshes: AssimpFormat.Mesh[],
    dispatch: AppDispatch
){
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
    if(meshIndices.length > 0){
        const mesh = meshes[meshIndices[0]];
        dispatch(addMesh({ mesh: {
            id: mesh.id,
            vertices: mesh.vertices,
            normals: mesh.normals,
            vertexIndices: mesh.faces.flat()
        } }));
        sceneNode.components.push(
            {
                type: "Mesh",
                id: uuidv4(),
                meshId: mesh.id
            },
            {
                id: uuidv4(),
                type: "Shading",
                shaderType: "simple"
            }
        );
    }
    for(const childNode of children){
        const sceneChildNode = createAssimpSceneNode(childNode, meshes, dispatch);
        sceneNode.childs.push(sceneChildNode);
    }

    return sceneNode;
}
