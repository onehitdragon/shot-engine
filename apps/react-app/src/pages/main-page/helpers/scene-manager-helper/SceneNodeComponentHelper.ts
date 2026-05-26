import type { Light, PbrShading, PhongShading, SimpleShading } from '@shot-engine/types';

export function createSimpleShadingComponent(){
    const component: SimpleShading = {
        id: "",
        type: "Shading",
        shaderType: "simple",
        culling: "none",
        transparent: false,
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
        ambient: {x: 0.1, y: 0.1, z: 0.1},
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
        metallic: 0,
        roughness: 0.01
    }
    return component;
}
export function createPointLightComponent(){
    const light: Light = {
        id: "",
        type: "Light",
        lightType: "PointLight",
        color: { x: 1, y: 1, z: 1 },
        intensity: 1000,
        radius: 1000,
    }
    return light;
}
export function createDirectionalLightComponent(){
    const light: Light = {
        id: "",
        type: "Light",
        lightType: "DirectionalLight",
        dir: { x: 0, y: -1, z: 0 },
        intensity: 1000,
        radius: 1000,
    }
    return light;
}
