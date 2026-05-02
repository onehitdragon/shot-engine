declare namespace SceneFormat{
    type vec3 = import("gl-matrix").vec3;
    export type Scene = {
        id: string,
        name: string,
        nodes: string[]
    }
    export type SceneNode = {
        id: string,
        name: string,
        components: string[],
        parent: string | null,
        childs: string[],
    }
    export type SceneOrbitCamera = {
        aspect: number,
        sphereCoordinate: { r: number, theta: number, phi: number },
        origin: vec3
    }
}
declare namespace MeshFormat{
    export type Mesh = {
        vertices: number[],
        normals: number[],
        uvs: number[],
        vertexIndices: number[]
    }
}
declare namespace PrefabFormat{
    export type Prefab = {
        nodeId: string,
        nodes: SceneFormat.SceneNode[],
        components: Components.Component[]
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
    export type Mesh = PrimitiveMesh | ImportMesh;
    export type MeshBase = ComponentBase & {
        type: "Mesh"
    }
    export type PrimitiveMesh = MeshBase & {
        meshType: "PrimitiveMesh",
        primitiveType: "CUBE" | "SPHERE" | "CYLINDER"
    }
    export type ImportMesh = MeshBase & {
        meshType: "ImportMesh",
        guid: string
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
        diffuseGuid: string,
        normalGuid: string,
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
