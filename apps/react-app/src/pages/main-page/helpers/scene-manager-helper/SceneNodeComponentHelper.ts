import type { Camera, Light, PbrShading, PhongShading, SimpleShading, SkyBox, Transform } from '@shot-engine/types';
import { Quat, Vec3, Vec4 } from '@shot-engine/math';

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
export function createSimpleShadingComponent(){
    const component: SimpleShading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        culling: "none",
        transparent: false,
        color: Vec4.FromValues(1, 1, 1 ,1)
    }
    return component;
}
export function createPhongShadingComponent(){
    const component: PhongShading = {
        id: "",
        type: "Shading",
        culling: "none",
        transparent: false,
        shaderType: "phong",
        diffuse: {
            type: "color",
            color: Vec3.FromValues(1, 1, 1)
        },
        specular: Vec3.FromValues(0, 0, 0),
        shininess: 1
    }
    return component;
}
export function createPbrShadingComponent(){
    const component: PbrShading = {
        id: "",
        type: "Shading",
        culling: "none",
        transparent: false,
        shaderType: "pbr",
        diffuse: {
            type: "color",
            color: Vec3.FromValues(1, 1, 1)
        },
        metallic: {
            type: "value",
            value: 0
        },
        roughness: {
            type: "value",
            value: 0.01
        },
        reflectance: 0.5, // F0 = 0.04,
        emissive: {
            color: {
                type: "color",
                color: Vec3.FromValues(0, 0, 0)
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
        intensity: 100,
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
