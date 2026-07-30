import type { GameObject, Mesh, PbrShading, Shading, Transform } from '@shot-engine/types';
import type { NodeState } from '../../../../global-state/slices/go-tree-slice';

export function createEmptyNode(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        editor: {
            euler: { x: 0, y: 0, z: 0}
        }
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
        scale: { x: 1, y: 1, z: 1 },
        editor: {
            euler: { x: 0, y: 0, z: 0}
        }
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
        culling: 'none',
        color: { x: 1, y: 1, z: 1 }
    }
    const sceneNode: NodeState = {
        name: "CubeNode",
        id: "",
        components: [transform, mesh, shading],
        childs: []
    }

    return sceneNode;
}
export function createSphereNode(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        editor: {
            euler: { x: 0, y: 0, z: 0}
        }
    }
    const mesh: Mesh = {
        id: "",
        type: "Mesh",
        meshRef: "sphere-engine.mesh"
    }
    const shading: Shading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        transparent: false,
        culling: 'none',
        color: { x: 1, y: 1, z: 1 }
    }
    const sceneNode: NodeState = {
        name: "SphereNode",
        id: "",
        components: [transform, mesh, shading],
        childs: []
    }

    return sceneNode;
}
export function createCylinderNode(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        editor: {
            euler: { x: 0, y: 0, z: 0}
        }
    }
    const mesh: Mesh = {
        id: "",
        type: "Mesh",
        meshRef: "cylinder-engine.mesh"
    }
    const shading: Shading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        transparent: false,
        culling: 'none',
        color: { x: 1, y: 1, z: 1 }
    }
    const sceneNode: NodeState = {
        name: "CylinderNode",
        id: "",
        components: [transform, mesh, shading],
        childs: []
    }

    return sceneNode;
}
export function createConeNode(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        editor: {
            euler: { x: 0, y: 0, z: 0}
        }
    }
    const mesh: Mesh = {
        id: "",
        type: "Mesh",
        meshRef: "cone-engine.mesh"
    }
    const shading: Shading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        transparent: false,
        culling: 'none',
        color: { x: 1, y: 1, z: 1 }
    }
    const sceneNode: NodeState = {
        name: "ConeNode",
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
        scale: { x: 1, y: 1, z: 1 },
        editor: {
            euler: { x: 0, y: 0, z: 0}
        }
    }
    const sceneNode: GameObject = {
        name: "EmptyNode",
        id: "",
        components: [transform],
        childs: [],
    }

    return sceneNode;
}
export function createPbrTest(){
    const metallics = [
        {
            name: "Silver",
            baseColor: [250,249,245]
        },
        {
            name: "Aluminum",
            baseColor: [244,245,245]
        },
        {
            name: "Platinum",
            baseColor: [214,209,200]
        },
        {
            name: "Iron",
            baseColor: [192,189,186]
        },
        {
            name: "Titanium",
            baseColor: [206,200,194]
        },
        {
            name: "Copper",
            baseColor: [251,216,184]
        },
        {
            name: "Gold",
            baseColor: [255,220,157]
        },
        {
            name: "Brass",
            baseColor: [244,228,173]
        },
    ];
    const nonMetallics = [
        {
            name: "Coal",
            baseColor: [50,50,50]
        },
        {
            name: "Rubber",
            baseColor: [53,53,53]
        },
        {
            name: "Mud",
            baseColor: [85,61,49]
        },
        {
            name: "Wood",
            baseColor: [135,92,60]
        },
        {
            name: "Vegetation",
            baseColor: [123,130,78]
        },
        {
            name: "Brick",
            baseColor: [148,125,117]
        },
        {
            name: "Sand",
            baseColor: [177,168,132]
        },
        {
            name: "Concrete",
            baseColor: [192,191,187]
        }
    ];

    function createSphere(
        name: string,
        x: number, z: number,
        baseColor: number[], metallic: number, roughness: number, reflectance: number
    ){
        const transform: Transform = {
            type: "Transform",
            id: "",
            pos: { x, y: 0, z },
            rot: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
            editor: {
                euler: { x: 0, y: 0, z: 0}
            }
        }
        const mesh: Mesh = {
            id: "",
            type: "Mesh",
            meshRef: "sphere-engine.mesh"
        }
        const shading: PbrShading = {
            id: "",
            type: "Shading",
            shaderType: "pbr",
            transparent: false,
            culling: 'none',
            diffuse: {
                type: "color",
                color: { x: baseColor[0] / 255, y: baseColor[1] / 255, z: baseColor[2] / 255 }
            },
            metallic: {
                type: "value",
                value: metallic
            },
            roughness: {
                type: "value",
                value: roughness
            },
            reflectance,
            emissive: {
                color: {
                    type: "color",
                    color: { x: 0, y: 0, z: 0 }
                },
                intensity: 0
            },
            normal: {
                type: "none"
            },
            ao: {
                type: "none"
            }
        }
        const sceneNode: NodeState = {
            name: name,
            id: "",
            components: [transform, mesh, shading],
            childs: []
        }

        return sceneNode;
    }

    const sphereChilds: NodeState[] = [];
    let z = 0;

    for(const metallic of metallics){
        let x = 0;
        let roughness = 0.9;
        for(let i = 1; i <= 9; i++){
            sphereChilds.push(createSphere(
                metallic.name, x, z, metallic.baseColor, 1, roughness, 0
            ));
            x += 2;
            roughness -= 0.1;
        }
        z -= 2;        
    }
    for(const nonMetallic of nonMetallics){
        let x = 0;
        let roughness = 0.9;
        for(let i = 1; i <= 9; i++){
            sphereChilds.push(createSphere(
                nonMetallic.name, x, z, nonMetallic.baseColor, 0, roughness, 0.5
            ));
            x += 2;
            roughness -= 0.1;
        }
        z -= 2;        
    }

    return sphereChilds;
}
