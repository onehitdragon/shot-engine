declare namespace SceneFormat{
    type vec3 = import("gl-matrix").vec3;
    export type Scene = {
        name: string,
        sceneGraph: SceneGraph,
        meshes: Mesh[]
    }
    export type SceneGraph = {
        nodes: SceneNode[]
    }
    export type SceneNode = {
        id: string,
        name: string,
        components: Components.Component[],
        childs: SceneNode[],
    }
    export type SceneOrbitCamera = {
        aspect: number,
        sphereCoordinate: { r: number, theta: number, phi: number },
        origin: vec3
    }
    export type Mesh = {
        id: string,
        vertices: number[],
        normals: number[],
        vertexIndices: number[]
    }
}
declare namespace Components{
    type vec3 = import("gl-matrix").vec3;
    export type Component = Transform | Mesh | Shading | Light;
    type ComponentBase = {
        id: string
    }
    export type Transform = ComponentBase & {
        type: "Transform"
        position: vec3,
        rotation: vec3,
        scale: vec3
    }
    export type Mesh = ComponentBase & {
        type: "Mesh",
        meshId: string
    }
    export type Shading = SimpleShading | PhongShading;
    export type ShadingBase = ComponentBase & {
        type: "Shading",
        culling: "none" | "back" | "front" | "both",
        transparent: boolean
    }
    export type SimpleShading = ShadingBase & {
        shaderType: "simple"
    }
    export type PhongShading = ShadingBase & {
        shaderType: "phong",
        diffuse: string,
        normal: string,
        ambient: vec3,
        shininess: float
    }
    export type Light = PointLight | DirectionalLight;
    export type LightBase = ComponentBase & {
        type: "Light"
    };
    export type PointLight = LightBase & {
        lightType: "PointLight",
        color: vec3
    }
    export type DirectionalLight = LightBase & {
        lightType: "DirectionalLight",
        dir: vec3
    }
}
