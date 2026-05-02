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
export type Transfrom = {
    type: "Transfrom",
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
export type Component = Transfrom | Mesh;
export type GameObjectPrefab = {
    prefabRef: string;
}
export type GameObject = {
    id: string,
    name: string,
    components: Component[];
    childs: SceneNode[];
}
export type SceneNode = GameObjectPrefab | GameObject;
export type Scene = {
    id: string;
    name: string;
    sceneNodes: SceneNode[];
}
