declare namespace SceneFormat{
    export type SceneGraph = {
        name: string,
        nodes: SceneNode[]
    }
    export type SceneNode = {
        id: string,
        name: string,
        childs: SceneNode[],
        components: Components.Component[]
    }
}
declare namespace Components{
    type vec3 = import("gl-matrix").vec3;
    type quat = import("gl-matrix").quat;
    export type Component = {
        type: string
    }
    export type Transform = {
        type: "Transform"
        position: vec3,
        rotation: quat,
        scale: vec3
    } & Component;
    export type Mesh = {
        type: "Mesh"
        vertices: Float32Array,
        vertexIndices: Uint32Array,
        normals: Float32Array,
        normalIndices: Uint32Array
    } & Component;
    export type Shading = {
        type: "Shading"
    } & Component
}