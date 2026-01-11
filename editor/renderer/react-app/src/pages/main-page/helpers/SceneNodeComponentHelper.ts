import { v4 as uuidv4 } from 'uuid';

export function createPointLightComponent(){
    const light: Components.Light = {
        id: uuidv4(),
        type: "Light",
        lightType: "PointLight",
        color: [1, 1, 1]
    }
    return light;
}
export function createDirectionalLightComponent(){
    const light: Components.Light = {
        id: uuidv4(),
        type: "Light",
        lightType: "DirectionalLight",
        dir: [0, -1, 0]
    }
    return light;
}
export function createSimpleShadingComponent(){
    const component: Components.SimpleShading = {
        id: uuidv4(),
        type: "Shading",
        culling: "none",
        transparent: false,
        shaderType: "simple",
    }
    return component;
}
export function createPhongShadingComponent(){
    const component: Components.PhongShading = {
        id: uuidv4(),
        type: "Shading",
        culling: "none",
        transparent: false,
        shaderType: "phong",
        ambient: [0.1, 0.1, 0.1],
        shininess: 1
    }
    return component;
}
