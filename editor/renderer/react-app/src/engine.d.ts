declare namespace SceneFormat{
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
}
declare namespace Components{
    type vec3 = import("gl-matrix").vec3;
    type quat = import("gl-matrix").quat;
    export type Component = Transform | Mesh | Shading;
    type ComponentBase = {
        id: string
    }
    export type Transform = ComponentBase & {
        type: "Transform"
        position: vec3,
        rotation: quat,
        scale: vec3
    }
    export type Mesh = ComponentBase & {
        type: "Mesh"
        vertices: number[],
        vertexIndices: number[],
        normals: number[],
        normalIndices: number[]
    }
    export type Shading = ComponentBase & {
        type: "Shading"
    }
}