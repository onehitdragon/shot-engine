import type { Mesh, SceneNode, Shading, Transform } from '@shot-engine/types';
import type { NodeState } from '../../../../global-state/slices/go-tree-slice';

export function createEmptyNode(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 }
    }
    const sceneNode: NodeState = {
        name: "EmptyNode",
        id: "",
        components: [transform],
        childs: [],
    }

    return sceneNode;
}
export function createCubeNode(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 }
    }
    const mesh: Mesh = {
        id: "",
        type: "Mesh",
        meshRef: "cube-engine.mesh"
    }
    const shading: Shading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        transparent: false,
        culling: 'none'
    }
    const sceneNode: NodeState = {
        name: "CubeNode",
        id: "",
        components: [transform, mesh, shading],
        childs: []
    }

    return sceneNode;
}
export function createEmptyPrefab(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 }
    }
    const sceneNode: SceneNode = {
        name: "EmptyNode",
        id: "",
        components: [transform],
        childs: [],
    }

    return sceneNode;
}
