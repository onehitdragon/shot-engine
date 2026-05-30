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
export type TransformEditor = {
    euler: Vec3
}
export type Transform = {
    type: "Transform",
    id: string,
    pos: Vec3,
    rot: Vec4,
    scale: Vec3,
    editor: TransformEditor
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
export type PbrShading = ShadingBase & {
    shaderType: "pbr",
    diffuse: {
        type: "image",
        imageRef: string
    } | {
        type: "color",
        color: Vec3
    },
    metallic: number,
    roughness: number,
}
export type Shading = SimpleShading | PhongShading | PbrShading;
export type LightBase = {
    type: "Light",
    id: string,
};
export type PointLight = LightBase & {
    lightType: "PointLight",
    color: Vec3,
    intensity: number,
    radius: number,
}
export type DirectionalLight = LightBase & {
    lightType: "DirectionalLight",
    dir: Vec3,
    intensity: number,
    radius: number,
}
export type Light = PointLight | DirectionalLight;
export type SkyBox = {
    type: "SkyBox",
    id: string,
    hdrRef: string,
}
export type Component = Transform | Mesh | Shading | Light | SkyBox;

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
    roots: SceneNode[],
}
