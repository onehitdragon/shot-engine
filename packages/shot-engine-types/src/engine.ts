import { Vec2, Vec3, Vec4, Mat4, Quat } from "@shot-engine/math";

export class Ray{
    public origin: Vec3;
    public dir: Vec3;
    constructor(origin: Vec3, dir: Vec3){
        this.origin = origin;
        this.dir = dir;
    }
    public static FromView(width: number, height: number, x: number, y: number, vpMat4: Mat4){
        const ndc = Vec2.FromValues(2*x/width - 1, 1 - 2*y/height); // x,y -> [-1, 1]
        const nearPoint = Vec3.FromValues(ndc.values[0], ndc.values[1], -1);
        const farPoint = Vec3.FromValues(ndc.values[0], ndc.values[1], 1);
        const invertVPMat4 = Mat4.Clone(vpMat4);
        Mat4.Invert(invertVPMat4, invertVPMat4);
        Vec3.TransformMat4(nearPoint, nearPoint, invertVPMat4);
        Vec3.TransformMat4(farPoint, farPoint, invertVPMat4);
        const rayDirection = Vec3.Create();
        Vec3.Sub(rayDirection, farPoint, nearPoint); // Near -> Far
        Vec3.Normalize(rayDirection, rayDirection);
        const ray = new Ray(nearPoint, rayDirection);
        return ray;
    }
    public static TransformSpace(ray: Ray, modelMat4: Mat4){
        const invertModelMat4 = Mat4.Clone(modelMat4);
        Mat4.Invert(invertModelMat4, invertModelMat4);
        const origin = Vec4.FromValues(ray.origin.values[0], ray.origin.values[1], ray.origin.values[2], 1);
        Vec4.TransformMat4(origin, origin, invertModelMat4);
        const dir = Vec4.FromValues(ray.dir.values[0], ray.dir.values[1], ray.dir.values[2], 0);
        Vec4.TransformMat4(dir, dir, invertModelMat4);
        return new Ray(
            Vec3.FromValues(origin.values[0], origin.values[1], origin.values[2]),
            Vec3.FromValues(dir.values[0], dir.values[1], dir.values[2])
        );
    }
    public aabbIntersect(aabb: AABB){
        let tMin = -Infinity;
        let tMax = Infinity;
        function slab(min: number, max: number, o: number, d: number){
            if(Math.abs(d) < 1e-8){
                return o >= min && o <= max;
            }
            let t1 = (min - o) / d;
            let t2 = (max - o) / d;
            if(t1 > t2) [t1, t2] = [t2, t1];
            tMin = Math.max(tMin, t1);
            tMax = Math.min(tMax, t2);
            return tMin <= tMax;
        }
        const check = 
            slab(aabb.min.values[0], aabb.max.values[0], this.origin.values[0], this.dir.values[0]) &&
            slab(aabb.min.values[1], aabb.max.values[1], this.origin.values[1], this.dir.values[1]) &&
            slab(aabb.min.values[2], aabb.max.values[2], this.origin.values[2], this.dir.values[2]) &&
            tMax >= 0
        return check;
    }
    public trigIntersect(v0: Vec3, v1: Vec3, v2: Vec3){
        const E1 = Vec3.Sub(new Vec3(), v1, v0);
        const E2 = Vec3.Sub(new Vec3(), v2, v0);
        const D = this.dir;
        const T = Vec3.Sub(new Vec3(), this.origin, v0);
        const DxE2 = Vec3.Cross(new Vec3(), D, E2);

        const detA = Vec3.Dot(E1, DxE2);
        if(detA < 1e-8) return false;

        const u = Vec3.Dot(T, DxE2) / detA;
        if(u < 0 || u > 1) return false;

        const TxE1 = Vec3.Cross(new Vec3(), T, E1);
        const v = Vec3.Dot(D, TxE1) / detA;
        if(v < 0 || u + v > 1) return false;

        const t = Vec3.Dot(E2, TxE1) / detA;
        if(t < 0) return false;

        return t;
    }
    public intersectPlane(p0: Vec3, normal: Vec3){
        const demon = Vec3.Dot(this.dir, normal);
        if(Math.abs(demon) < 1e-8) return false;
        const num = Vec3.Dot(Vec3.Sub(new Vec3(), p0, this.origin), normal);
        const t = num / demon;
        if(t < 0) return false;
        return t;
    }
    public getPoint(t: number){
        return Vec3.Add(new Vec3(), this.origin, Vec3.Scale(new Vec3(), this.dir, t));
    }
}
export class AABB{
    public min: Vec3;
    public max: Vec3;
    constructor(min: Vec3, max: Vec3){
        this.min = min;
        this.max = max;
    }
    public static FromVertices(values: Float32Array | number[]){
        if(values.length % 3 !== 0) throw "values is multiply of 3";
        const min = Vec3.FromValues(Infinity, Infinity, Infinity);
        const max = Vec3.FromValues(-Infinity, -Infinity, -Infinity);
        const valueVec3 = new Vec3();
        for(let i = 0; i < values.length; i += 3){
            Vec3.Set(valueVec3, values[i], values[i + 1], values[i + 2]);
            Vec3.Min(min, min, valueVec3);
            Vec3.Max(max, max, valueVec3);
        }
        return new AABB(min, max);
    }
    public static FromVec3s(vec3s: Vec3[]){
        const min = Vec3.FromValues(Infinity, Infinity, Infinity);
        const max = Vec3.FromValues(-Infinity, -Infinity, -Infinity);
        for(const vec3 of vec3s){
            Vec3.Min(min, min, vec3);
            Vec3.Max(max, max, vec3);
        }
        return new AABB(min, max);
    }
}
export type TransformEditor = {
    euler: Vec3
}
export class Transform{
    public type = "Transform" as const;
    public id: string;
    public pos: Vec3;
    public rot: Quat;
    public scale: Vec3;
    public editor: TransformEditor;
    constructor(){
        this.id = "";
        this.pos = new Vec3();
        this.rot = new Quat();
        this.scale = new Vec3();
        this.editor = { euler: new Vec3() }
    }
    public static Equal(t1: Transform, t2: Transform){
        return (
            Vec3.Equals(t1.pos, t2.pos) &&
            Quat.Equals(t1.rot, t2.rot) &&
            Vec3.Equals(t1.scale, t2.scale)
        );
    }
}
export type GizmoTransform = {
    type: "GizmoTransform",
    id: string,
    pos: Vec3,
    rot: Quat,
    scale: Vec3
}
export type MeshRenderer = {
    type: "MeshRenderer",
    id: string,
    meshRef?: string, // mesh asset
    materialRefs: (string | undefined)[], // mat assets
}
export type SkinnedMeshRenderer = {
    type: "SkinnedMeshRenderer",
    id: string,
    meshRef?: string, // mesh asset
    materialRefs: (string | undefined)[], // mat assets
    jointRefs: (string | undefined)[], // joint gameobjects
}
export class MeshHelper{
    private static GetTangent(
        vertex1: Vec3, vertex2: Vec3, vertex3: Vec3,
        uv1: Vec2, uv2: Vec2, uv3: Vec2
    ){
        const edge1 = Vec3.Sub(new Vec3(), vertex2, vertex1);
        const edge2 = Vec3.Sub(new Vec3(), vertex3, vertex1);
        const deltaUV1 = Vec2.Sub(new Vec2(), uv2, uv1);
        const deltaUV2 = Vec2.Sub(new Vec2(), uv3, uv1);
        const det = (deltaUV1.values[0] * deltaUV2.values[1] - deltaUV2.values[0] * deltaUV1.values[1]);
        if(Math.abs(det) < 1e-8) return Vec3.Zero(new Vec3());
        const f = 1 / det;
        const tangent = new Vec3();
        tangent.values[0] = f * (deltaUV2.values[1] * edge1.values[0] - deltaUV1.values[1] * edge2.values[0]);
        tangent.values[1] = f * (deltaUV2.values[1] * edge1.values[1] - deltaUV1.values[1] * edge2.values[1]);
        tangent.values[2] = f * (deltaUV2.values[1] * edge1.values[2] - deltaUV1.values[1] * edge2.values[2]);
        return Vec3.Normalize(new Vec3(), tangent);
    }
    public static InterleaveArrayTangent(
        interleaveArray: Float32Array, // vertex(3), normal(3), uv(2)
        indices: ArrayLike<number>
    ){
        const vertexCount = Math.floor(interleaveArray.length / 8);
        const tangents = Array.from(
            { length: vertexCount },
            () => new Float32Array([0,0,0])
        );
        for(let i = 0; i < indices.length; i += 3){
            const i0 = indices[i];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];
            const index1 = i0 * 8; // 3 + 3 + 2
            const index2 = i1 * 8; // 3 + 3 + 2
            const index3 = i2 * 8; // 3 + 3 + 2
            const vertex1 = Vec3.FromValues(
                interleaveArray[index1 + 0],
                interleaveArray[index1 + 1],
                interleaveArray[index1 + 2]
            );
            const uv1 = Vec2.FromValues(
                interleaveArray[index1 + 6],
                interleaveArray[index1 + 7]
            );
            const vertex2 = Vec3.FromValues(
                interleaveArray[index2 + 0],
                interleaveArray[index2 + 1],
                interleaveArray[index2 + 2]
            );
            const uv2 = Vec2.FromValues(
                interleaveArray[index2 + 6],
                interleaveArray[index2 + 7]
            );
            const vertex3 = Vec3.FromValues(
                interleaveArray[index3 + 0],
                interleaveArray[index3 + 1],
                interleaveArray[index3 + 2]
            );
            const uv3 = Vec2.FromValues(
                interleaveArray[index3 + 6],
                interleaveArray[index3 + 7]
            );
            const tangent = MeshHelper.GetTangent(vertex1, vertex2, vertex3, uv1, uv2, uv3);
            tangents[i0][0] += tangent.values[0];
            tangents[i0][1] += tangent.values[1];
            tangents[i0][2] += tangent.values[2];
            tangents[i1][0] += tangent.values[0];
            tangents[i1][1] += tangent.values[1];
            tangents[i1][2] += tangent.values[2];
            tangents[i2][0] += tangent.values[0];
            tangents[i2][1] += tangent.values[1];
            tangents[i2][2] += tangent.values[2];
        }
        for(let i = 0; i < vertexCount; i++){
            let normal = Vec3.FromValues(
                interleaveArray[i * 8 + 3],
                interleaveArray[i * 8 + 4],
                interleaveArray[i * 8 + 5],
            );
            Vec3.Normalize(normal, normal);
            let tangent = Vec3.FromValues(
                tangents[i][0],
                tangents[i][1],
                tangents[i][2],
            );
            Vec3.Sub(tangent, tangent, Vec3.Scale(new Vec3(), normal, Vec3.Dot(normal, tangent)));
            Vec3.Normalize(tangent, tangent);
            tangents[i][0] = tangent.values[0];
            tangents[i][1] = tangent.values[1];
            tangents[i][2] = tangent.values[2];
        }
        const newInterleaveArray = new Float32Array(vertexCount * 11);
        for(let i = 0; i < vertexCount; i++){
            const src = i * 8;
            const dst = i * 11;
            newInterleaveArray.set(interleaveArray.subarray(src, src + 8), dst);
            newInterleaveArray[dst + 8] = tangents[i][0];
            newInterleaveArray[dst + 9] = tangents[i][1];
            newInterleaveArray[dst + 10] = tangents[i][2];
        }
        return newInterleaveArray;
    }
}
export type LightShadow = {
    enable: boolean,
    bias: number,
    normalBias: number,
    mapSize: number,
    softShadow: "hard" | "smooth"
}
export type LightBase = {
    type: "Light",
    id: string,
    intensity: number,
    color: Vec3,
    shadow: LightShadow
};
export type DirectionalLight = LightBase & {
    lightType: "DirectionalLight",
}
export type PointLight = LightBase & {
    lightType: "PointLight",
    radius: number
}
export type SpotLight = LightBase & {
    lightType: "SpotLight",
    radius: number,
    innerAngle: number,
    outerAngle: number
}
export type Light = DirectionalLight | PointLight | SpotLight;
export type Camera = {
    type: "Camera",
    id: string,
    fovy: number
}
export type SkyBox = {
    type: "SkyBox",
    id: string,
    hdrRef: string,
}
export type Skeleton = {
    type: "Skeleton",
    id: string,
    rootJointId: string,
}
export type TextOrString = { type: "text"; textRef: string } | { type: "string"; value: string };
export type UILayoutAsset = {
    imageRefs: string[]
}
export type UILayout = {
    type: "UILayout",
    id: string,
    html: TextOrString,
    css: TextOrString,
    js: TextOrString
}
export type Component = Transform | GizmoTransform | MeshRenderer | SkinnedMeshRenderer | 
    Light | Camera | SkyBox | Skeleton | UILayout;
export class ComponentHelper{
    public static FindComponentByType<T extends Component["type"]>(
        components: Component[],
        type: T
    ){
        return components.find(c => c.type == type) as Extract<Component, { type: T }> | undefined;
    }
}

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
export function isGameObjectPrefab(sceneNode: SceneNode): sceneNode is GameObjectPrefab{
    return "prefabRef" in sceneNode;
}
export function isGameObject(sceneNode: SceneNode): sceneNode is GameObject{
    return "childs" in sceneNode;
}
export type Scene = {
    id: string,
    name: string,
    roots: SceneNode[],
}
