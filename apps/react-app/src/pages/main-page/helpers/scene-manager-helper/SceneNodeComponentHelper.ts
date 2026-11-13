import type { Camera, Light, SkyBox, Transform, MeshRenderer } from '@shot-engine/types';
import { Quat, Vec3 } from '@shot-engine/math';

export function createTransformComponent(){
    const transform: Transform = {
        type: "Transform",
        id: "",
        pos: Vec3.FromValues(0, 0, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1, 1, 1),
        editor: {
            euler: Vec3.FromValues(0, 0, 0)
        }
    }
    return transform;
}
export function createMeshRendererComponent(){
    const component: MeshRenderer = {
        id: "",
        type: "MeshRenderer",
        materialRefs: []
    }
    return component;
}
export function createPointLightComponent(){
    const light: Light = {
        id: "",
        type: "Light",
        lightType: "PointLight",
        color: Vec3.FromValues(1, 1, 1),
        intensity: 100,
        radius: 10,
        shadow: {
            enable: false,
            bias: 0.005,
            normalBias: 0.05,
            mapSize: 1024,
            softShadow: "hard"
        }
    }
    return light;
}
export function createDirectionalLightComponent(){
    const light: Light = {
        id: "",
        type: "Light",
        lightType: "DirectionalLight",
        color: Vec3.FromValues(1, 1, 1),
        intensity: 10,
        shadow: {
            enable: false,
            bias: 0.005,
            normalBias: 0.05,
            mapSize: 1024,
            softShadow: "hard"
        }
    }
    return light;
}
export function createSpotLightComponent(){
    const light: Light = {
        id: "",
        type: "Light",
        lightType: "SpotLight",
        color: Vec3.FromValues(1, 1, 1),
        intensity: 100,
        radius: 10,
        innerAngle: 30,
        outerAngle: 45,
        shadow: {
            enable: false,
            bias: 0.005,
            normalBias: 0.05,
            mapSize: 1024,
            softShadow: "hard"
        }
    }
    return light;
}
export function createCameraComponent(){
    const camera: Camera = {
        id: "",
        type: "Camera",
        fovy: 90
    }
    return camera;
}
export function createSkyBoxComponent(){
    const skyBox: SkyBox = {
        id: "",
        type: "SkyBox",
        hdrRef: ""
    }
    return skyBox;
}
