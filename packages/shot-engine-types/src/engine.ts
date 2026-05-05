export type Vec3 = {
    x: number,
    y: number,
    z: number
}
export type Vec4 = {
    x: number,
    y: number,
    z: number,
    w: number
}
export type Transform = {
    type: "Transform",
    id: string,
    pos: Vec3,
    rot: Vec4,
    scale: Vec3
}
export type Mesh = {
    type: "Mesh",
    id: string,
    meshRef: string
}
export type ShadingBase = {
    type: "Shading",
    id: string,
    culling: "none" | "back" | "front" | "both",
    transparent: boolean
}
export type SimpleShading = ShadingBase & {
    shaderType: "simple"
}
export type PhongShading = ShadingBase & {
    shaderType: "phong",
    diffuse: {
        type: "image",
        imageRef: string
    } | {
        type: "color",
        color: Vec3
    },
    ambient: Vec3,
    shininess: number
}
export type Shading = SimpleShading | PhongShading;
export type LightBase = {
    type: "Light",
    id: string,
};
export type PointLight = LightBase & {
    lightType: "PointLight",
    color: Vec3
}
export type DirectionalLight = LightBase & {
    lightType: "DirectionalLight",
    dir: Vec3
}
export type Light = PointLight | DirectionalLight;
export type Component = Transform | Mesh | Shading | Light;

export type GameObjectPrefab = {
    id: string,
    prefabRef: string,
}
export type GameObject = {
    id: string,
    name: string,
    components: Component[],
    childs: SceneNode[],
}
export type SceneNode = GameObjectPrefab | GameObject;
export type Scene = {
    id: string,
    name: string,
    sceneNodes: SceneNode[],
}
