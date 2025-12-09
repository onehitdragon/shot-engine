import { v4 as uuidv4 } from 'uuid';
import { cubeMeshData } from './mesh-datas';

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
                type: "Mesh",
                meshType: "cube",
                meshId: "cube",
                id: uuidv4(),
                vertices: cubeMeshData.vertices,
                vertexIndices: cubeMeshData.vertexIndices,
                normals: cubeMeshData.normals
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
