import type { GameObject, MeshRenderer } from '@shot-engine/types';
import type { NodeState } from '../../../../global-state/slices/go-tree-slice';
import { createTransformComponent } from './SceneNodeComponentHelper';

export function createEmptyNode(){
    const transform = createTransformComponent();
    const sceneNode: NodeState = {
        name: "EmptyNode",
        id: "",
        components: [transform],
        childs: [],
    }

    return sceneNode;
}
export function createCubeNode(){
    const transform = createTransformComponent();
    const meshRenderer: MeshRenderer = {
        id: "",
        type: "MeshRenderer",
        meshRef: "cube-engine.mesh",
        materialRefs: ["simple-material-engine.mat"],
    }
    const sceneNode: NodeState = {
        name: "CubeNode",
        id: "",
        components: [transform, meshRenderer],
        childs: []
    }

    return sceneNode;
}
export function createSphereNode(){
    const transform = createTransformComponent();
    const meshRenderer: MeshRenderer = {
        id: "",
        type: "MeshRenderer",
        meshRef: "sphere-engine.mesh",
        materialRefs: ["simple-material-engine.mat"],
    }
    const sceneNode: NodeState = {
        name: "SphereNode",
        id: "",
        components: [transform, meshRenderer],
        childs: []
    }

    return sceneNode;
}
export function createCylinderNode(){
    const transform = createTransformComponent();
    const meshRenderer: MeshRenderer = {
        id: "",
        type: "MeshRenderer",
        meshRef: "cylinder-engine.mesh",
        materialRefs: ["simple-material-engine.mat"],
    }
    const sceneNode: NodeState = {
        name: "CylinderNode",
        id: "",
        components: [transform, meshRenderer],
        childs: []
    }

    return sceneNode;
}
export function createConeNode(){
    const transform = createTransformComponent();
    const meshRenderer: MeshRenderer = {
        id: "",
        type: "MeshRenderer",
        meshRef: "cone-engine.mesh",
        materialRefs: ["simple-material-engine.mat"],
    }
    const sceneNode: NodeState = {
        name: "ConeNode",
        id: "",
        components: [transform, meshRenderer],
        childs: []
    }

    return sceneNode;
}
export function createEmptyPrefab(){
    const transform = createTransformComponent();
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
        const transform = createTransformComponent();
        // using mat asset so this can't
        // const mesh: Mesh = {
        //     id: "",
        //     type: "Mesh",
        //     meshRef: "sphere-engine.mesh"
        // }
        // const shading: PbrShading = {
        //     id: "",
        //     type: "Shading",
        //     shaderType: "pbr",
        //     transparent: false,
        //     culling: "none",
        //     diffuse: {
        //         type: "color",
        //         color: Vec3.FromValues(baseColor[0] / 255, baseColor[1] / 255, baseColor[2] / 255)
        //     },
        //     metallic: {
        //         type: "value",
        //         value: metallic
        //     },
        //     roughness: {
        //         type: "value",
        //         value: roughness
        //     },
        //     reflectance,
        //     emissive: {
        //         color: {
        //             type: "color",
        //             color: Vec3.FromValues(0, 0, 0)
        //         },
        //         intensity: 0
        //     },
        //     normal: {
        //         type: "none"
        //     },
        //     ao: {
        //         type: "none"
        //     }
        // }
        const sceneNode: NodeState = {
            name: name,
            id: "",
            components: [transform],
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
