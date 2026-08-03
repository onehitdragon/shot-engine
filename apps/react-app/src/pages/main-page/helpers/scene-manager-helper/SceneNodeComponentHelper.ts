import type { Light, PbrShading, PhongShading, SimpleShading, SkyBox } from '@shot-engine/types';

export function createSimpleShadingComponent(){
    const component: SimpleShading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        culling: "none",
        transparent: false,
        color: { x: 1, y: 1, z: 1 }
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
            color: { x: 1, y: 1, z: 1 }
        },
        specular: {x: 0, y: 0, z: 0},
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
            color: { x: 1, y: 1, z: 1 }
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
    return component;
}
export function createPointLightComponent(){
    const light: Light = {
        id: "",
        type: "Light",
        lightType: "PointLight",
        color: { x: 1, y: 1, z: 1 },
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
        color: { x: 1, y: 1, z: 1 },
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
        color: { x: 1, y: 1, z: 1 },
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
export function createSkyBoxComponent(){
    const skyBox: SkyBox = {
        id: "",
        type: "SkyBox",
        hdrRef: ""
    }
    return skyBox;
}
