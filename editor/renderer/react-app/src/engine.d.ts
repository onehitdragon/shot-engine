declare namespace SceneFormat{
    type vec3 = import("gl-matrix").vec3;
    export type SceneGraph = {
        name: string,
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
}
declare namespace Components{
    type vec3 = import("gl-matrix").vec3;
    export type Component = Transform | Mesh | Shading;
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
        meshType: "cube" | "sphere" | "other",
        meshId: string,
        vertices: number[],
        vertexIndices: number[],
        normals: number[],
    }
    export type Shading = ComponentBase & {
        type: "Shading",
        shaderType: "simple"
    }
}