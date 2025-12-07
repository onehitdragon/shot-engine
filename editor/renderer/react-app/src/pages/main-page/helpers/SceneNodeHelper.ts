import { v4 as uuidv4 } from 'uuid';

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
                id: uuidv4(),
                vertices: [
                    -1,
                    -1,
                    1,
                    -1,
                    1,
                    1,
                    -1,
                    -1,
                    -1,
                    -1,
                    1,
                    -1,
                    1,
                    -1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    -1,
                    -1,
                    1,
                    1,
                    -1
                ],
                vertexIndices: [
                    1,
                    2,
                    0,
                    3,
                    6,
                    2,
                    7,
                    4,
                    6,
                    5,
                    0,
                    4,
                    6,
                    0,
                    2,
                    3,
                    5,
                    7,
                    1,
                    3,
                    2,
                    3,
                    7,
                    6,
                    7,
                    5,
                    4,
                    5,
                    1,
                    0,
                    6,
                    4,
                    0,
                    3,
                    1,
                    5
                ],
                normals: [],
                normalIndices: []
            }
        ],
        childs: [],
    }

    return sceneNode;
}
