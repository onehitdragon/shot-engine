import * as glm from "gl-matrix";

export class Vec2{
    public x: number = 0;
    public y: number = 0;
    public static FromArray(arr: glm.vec2){
        return { x: arr[0], y: arr[1] };
    }
    public static ToArray(vec2: Vec2){
        return [vec2.x, vec2.y];
    }
    public static Sub(v1In: Vec2, v2In: Vec2){
        const v1 = Vec2.ToArray(v1In);
        const v2 = Vec2.ToArray(v2In);
        const result = glm.vec2.create();
        glm.vec2.subtract(result, v1, v2);
        return Vec2.FromArray(result);
    }
}
export class Vec3{
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public static Equal(v1: Vec3, v2: Vec3){
        return (v1.x === v2.x && v1.y === v2.y && v1.z === v2.z)
    }
    public static FromArray(arr: glm.vec3){
        return { x: arr[0], y: arr[1], z: arr[2] }
    }
    public static ToArray(vec3: Vec3){
        return [vec3.x, vec3.y, vec3.z];
    }
    public static Zero(){
        return { x: 0, y: 0, z: 0 }
    }
    public static Up(){
        return { x: 0, y: 1, z: 0 }
    }
    public static Right(){
        return { x: 1, y: 0, z: 0 }
    }
    public static Forward(){
        return { x: 0, y: 0, z: 1 }
    }
    public static Axis(axis: "x" | "y" | "z"){
        if(axis === "x") return Vec3.Right();
        if(axis === "y") return Vec3.Up();
        if(axis === "z") return Vec3.Forward();
        return Vec3.Zero();
    }
    public static Sub(v1In: Vec3, v2In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const v2 = Vec3.ToArray(v2In);
        const result = glm.vec3.create();
        glm.vec3.subtract(result, v1, v2);
        return Vec3.FromArray(result);
    }
    public static Add(v1In: Vec3, v2In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const v2 = Vec3.ToArray(v2In);
        const result = glm.vec3.create();
        glm.vec3.add(result, v1, v2);
        return Vec3.FromArray(result);
    }
    public static Scale(vIn: Vec3, b: number){
        const v = Vec3.ToArray(vIn);
        const result = glm.vec3.create();
        glm.vec3.scale(result, v, b);
        return Vec3.FromArray(result);
    }
    public static Dot(v1In: Vec3, v2In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const v2 = Vec3.ToArray(v2In);
        const result = glm.vec3.dot(v1, v2);
        return result;
    }
    public static Cross(v1In: Vec3, v2In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const v2 = Vec3.ToArray(v2In);
        const result = glm.vec3.create();
        glm.vec3.cross(result, v1, v2);
        return Vec3.FromArray(result);
    }
    public static Normalize(vIn: Vec3){
        const v = Vec3.ToArray(vIn);
        const result = glm.vec3.create();
        glm.vec3.normalize(result, v);
        return Vec3.FromArray(result);
    }
    public static TransformMat3(vIn: Vec3, mat3: Mat3){
        const v = Vec3.ToArray(vIn);
        const result = glm.vec3.create();
        glm.vec3.transformMat3(result, v, mat3.values);
        return Vec3.FromArray(result);
    }
    public static TransformMat4(vIn: Vec3, mat4: Mat4){
        const v = Vec3.ToArray(vIn);
        const result = glm.vec3.create();
        glm.vec3.transformMat4(result, v, mat4.values);
        return Vec3.FromArray(result);
    }
    public static Distance(v1In: Vec3, v2In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const v2 = Vec3.ToArray(v2In);
        return glm.vec3.distance(v1, v2);
    }
    public static Length(v1In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        return glm.vec3.length(v1);
    }
    public static Ceil(v1In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const result = glm.vec3.create();
        glm.vec3.ceil(result, v1);
        return Vec3.FromArray(result);
    }
    public static Floor(v1In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const result = glm.vec3.create();
        glm.vec3.floor(result, v1);
        return Vec3.FromArray(result);
    }
    public static Round(v1In: Vec3){
        const v1 = Vec3.ToArray(v1In);
        const result = glm.vec3.create();
        glm.vec3.round(result, v1);
        return Vec3.FromArray(result);
    }
}
export class Vec4{
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public w: number = 0;
    public static Equal(v1: Vec4, v2: Vec4){
        return (v1.x === v2.x && v1.y === v2.y && v1.z === v2.z && v1.w === v2.w);
    }
    public static FromArray(arr: glm.vec4){
        return { x: arr[0], y: arr[1], z: arr[2], w: arr[3] }
    }
    public static TransformMat4(vec4: Vec4, mat4: Mat4){
        const result = glm.vec4.create();
        glm.vec4.transformMat4(result, [vec4.x, vec4.y, vec4.z, vec4.w], mat4.values);
        return Vec4.FromArray(result);
    }
}
export class Quat{
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public w: number = 1;
    public static FromArray(arr: glm.quat){
        return { x: arr[0], y: arr[1], z: arr[2], w: arr[3] }
    }
    public static ToArray(quat: Quat){
        return [quat.x, quat.y, quat.z, quat.w];
    }
    public static FromMat3(mat3: Mat3){
        const result = glm.quat.create();
        glm.quat.fromMat3(result, mat3.values);
        return Quat.FromArray(result);
    }
}
export class Mat4{
    public values: number[];
    constructor(){
        this.values = new Array(16).fill(0);
    }
    public static FromArray(values: glm.mat4 | number[]){
        const mat4 = new Mat4();
        mat4.values = [...values];
        return mat4;
    }
    public static Equal(m1: Mat4, m2: Mat4){
        for(let i = 0; i < 16; i++){
            if(m1.values[i] !== m2.values[i]) return false;
        }
        return true;
    }
    public static Multiply(m1: Mat4, m2: Mat4){
        const result = new Mat4();
        glm.mat4.multiply(result.values, m1.values, m2.values);
        return result;
    }
    public static FromTRS(trs: TRS){
        const { pos, rot, scale } = trs;
        const modelMat4 = glm.mat4.create();
        const q = glm.quat.fromValues(rot.x, rot.y, rot.z, rot.w);
        glm.mat4.fromRotationTranslationScale(
            modelMat4, q, [pos.x, pos.y, pos.z], [scale.x, scale.y, scale.z]
        );
        return Mat4.FromArray(modelMat4);
    }
    public static LookAt(eyeIn: Vec3, centerIn: Vec3, upIn: Vec3){
        const eye = Vec3.ToArray(eyeIn);
        const center = Vec3.ToArray(centerIn);
        const up = Vec3.ToArray(upIn);
        const result = new Mat4();
        glm.mat4.lookAt(result.values, eye, center, up);
        return result;
    }
    public static Perspective(fovy: number, aspect: number, near: number, far: number){
        const result = new Mat4();
        glm.mat4.perspective(result.values, fovy, aspect, near, far);
        return result;
    }
    public static Ortho(left: number, right: number, bottom: number, top: number, near: number, far: number){
        const result = new Mat4();
        glm.mat4.ortho(result.values, left, right, bottom, top, near, far);
        return result;
    }
    public static GetTranslation(mat4In: Mat4){
        const result = glm.vec3.create();
        glm.mat4.getTranslation(result, mat4In.values);
        return Vec3.FromArray(result);
    }
    public static Invert(mat4In: Mat4){
        const result = new Mat4();
        glm.mat4.invert(result.values, mat4In.values);
        return result;
    }
    public static GetRotation(mat4In: Mat4){
        const result = glm.vec4.create();
        glm.mat4.getRotation(result, mat4In.values);
        return Vec4.FromArray(result);
    }
    public static GetAxis(mat4In: Mat4, axis: "x" | "y" | "z"){
        if(axis === "x"){
            return Vec3.Normalize(
                Vec3.FromArray([mat4In.values[0], mat4In.values[1], mat4In.values[2]])
            );
        }
        if(axis === "y"){
            return Vec3.Normalize(
                Vec3.FromArray([mat4In.values[4], mat4In.values[5], mat4In.values[6]])
            );
        }
        if(axis === "z"){
            return Vec3.Normalize(
                Vec3.FromArray([mat4In.values[8], mat4In.values[9], mat4In.values[10]])
            );
        }
        return Vec3.Zero();
    }
    public static Identity(){
        const result = new Mat4();
        glm.mat4.identity(result.values);
        return result;
    }
    public static FromScaling(v3In: Vec3){
        const v3 = Vec3.ToArray(v3In);
        const result = new Mat4();
        glm.mat4.fromScaling(result.values, v3);
        return result;
    }
}
export class Mat3{
    public values: number[];
    constructor(){
        this.values = new Array(9).fill(0);
    }
    public static FromArray(values: glm.mat3 | number[]){
        const mat3 = new Mat3();
        mat3.values = [...values];
        return mat3;
    }
    public static NormalFromMat4(mat4In: Mat4){
        const result = new Mat3();
        glm.mat3.normalFromMat4(result.values, mat4In.values);
        return result;
    }
    public static FromMat4(mat4In: Mat4){
        const result = new Mat3();
        glm.mat3.fromMat4(result.values, mat4In.values);
        return result;
    }
}
export class TRS{
    public pos: Vec3 = { x: 0, y: 0, z: 0 };
    public rot: Vec4 = { x: 0, y: 0, z: 0, w: 1 };
    public scale: Vec3 = { x: 0, y: 0, z: 0 };
}
export class Ray{
    public origin: Vec3;
    public dir: Vec3;
    constructor(origin: Vec3, dir: Vec3){
        this.origin = origin;
        this.dir = dir;
    }
    public static FromView(width: number, height: number, x: number, y: number, vpMat4: Mat4){
        const ndc = glm.vec2.fromValues(2*x/width - 1, 1 - 2*y/height); // x,y -> [-1, 1]
        const nearPoint = glm.vec3.fromValues(ndc[0], ndc[1], -1);
        const farPoint = glm.vec3.fromValues(ndc[0], ndc[1], 1);
        const invertVPMat4 = glm.mat4.create();
        if(!glm.mat4.invert(invertVPMat4, vpMat4.values)) throw "cant invert";
        glm.vec3.transformMat4(nearPoint, nearPoint, invertVPMat4);
        glm.vec3.transformMat4(farPoint, farPoint, invertVPMat4);
        const rayDirection = glm.vec3.create();
        glm.vec3.subtract(rayDirection, farPoint, nearPoint); // Near -> Far
        glm.vec3.normalize(rayDirection, rayDirection);
        const ray = new Ray(Vec3.FromArray(nearPoint), Vec3.FromArray(rayDirection));
        return ray;
    }
    public static TransformSpace(ray: Ray, modelMat4: Mat4){
        const invertModelMat4 = glm.mat4.create();
        if(!glm.mat4.invert(invertModelMat4, modelMat4.values)) throw "cant invert modelMat4";
        const origin = glm.vec4.fromValues(ray.origin.x, ray.origin.y, ray.origin.z, 1);
        glm.vec4.transformMat4(origin, origin, invertModelMat4);
        const dir = glm.vec4.fromValues(ray.dir.x, ray.dir.y, ray.dir.z, 0);
        glm.vec4.transformMat4(dir, dir, invertModelMat4);
        return new Ray(
            Vec3.FromArray(origin),
            Vec3.FromArray(dir),
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
            slab(aabb.min.x, aabb.max.x, this.origin.x, this.dir.x) &&
            slab(aabb.min.y, aabb.max.y, this.origin.y, this.dir.y) &&
            slab(aabb.min.z, aabb.max.z, this.origin.z, this.dir.z) &&
            tMax >= 0
        return check;
    }
    public trigIntersect(v0: Vec3, v1: Vec3, v2: Vec3){
        const E1 = Vec3.Sub(v1, v0);
        const E2 = Vec3.Sub(v2, v0);
        const D = this.dir;
        const T = Vec3.Sub(this.origin, v0);
        const DxE2 = Vec3.Cross(D, E2);

        const detA = Vec3.Dot(E1, DxE2);
        if(detA < 1e-8) return false;

        const u = Vec3.Dot(T, DxE2) / detA;
        if(u < 0 || u > 1) return false;

        const TxE1 = Vec3.Cross(T, E1);
        const v = Vec3.Dot(D, TxE1) / detA;
        if(v < 0 || u + v > 1) return false;

        const t = Vec3.Dot(E2, TxE1) / detA;
        if(t < 0) return false;

        return t;
    }
    public intersectPlane(p0: Vec3, normal: Vec3){
        const demon = Vec3.Dot(this.dir, normal);
        if(Math.abs(demon) < 1e-8) return false;
        const num = Vec3.Dot(Vec3.Sub(p0, this.origin), normal);
        const t = num / demon;
        if(t < 0) return false;
        return t;
    }
    public getPoint(t: number){
        return Vec3.Add(this.origin, Vec3.Scale(this.dir, t));
    }
}
export class AABB{
    public min: Vec3;
    public max: Vec3;
    constructor(min: Vec3, max: Vec3){
        this.min = min;
        this.max = max;
    }
    public static FromVertices(values: number[]){
        if(values.length % 3 !== 0) throw "values is multiply of 3";
        let min: Vec3 = {x: Infinity, y: Infinity, z: Infinity};
        let max: Vec3 = {x: -Infinity, y: -Infinity, z: -Infinity};
        for(let i = 0; i < values.length; i += 3){
            min.x = Math.min(min.x, values[i]);
            min.y = Math.min(min.y, values[i + 1]);
            min.z = Math.min(min.z, values[i + 2]);
            max.x = Math.max(max.x, values[i]);
            max.y = Math.max(max.y, values[i + 1]);
            max.z = Math.max(max.z, values[i + 2]);
        }
        return new AABB(min, max);
    }
    public static FromVec3s(vec3s: Vec3[]){
        let min: Vec3 = {x: Infinity, y: Infinity, z: Infinity};
        let max: Vec3 = {x: -Infinity, y: -Infinity, z: -Infinity};
        for(const vec3 of vec3s){
            min.x = Math.min(min.x, vec3.x);
            min.y = Math.min(min.y, vec3.y);
            min.z = Math.min(min.z, vec3.z);
            max.x = Math.max(max.x, vec3.x);
            max.y = Math.max(max.y, vec3.y);
            max.z = Math.max(max.z, vec3.z);
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
    public rot: Vec4;
    public scale: Vec3;
    public editor: TransformEditor;
    constructor(){
        this.id = "";
        this.pos = new Vec3();
        this.rot = new Vec4();
        this.scale = new Vec3();
        this.editor = { euler: new Vec3() }
    }
    public static Equal(t1: Transform, t2: Transform){
        return (
            Vec3.Equal(t1.pos, t2.pos) &&
            Vec4.Equal(t1.rot, t2.rot) &&
            Vec3.Equal(t1.scale, t2.scale)
        );
    }
}
export type GizmoTransform = {
    type: "GizmoTransform",
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
export class MeshHelper{
    private static GetTangent(
        vertex1: Vec3, vertex2: Vec3, vertex3: Vec3,
        uv1: Vec2, uv2: Vec2, uv3: Vec2
    ){
        const edge1 = Vec3.Sub(vertex2, vertex1);
        const edge2 = Vec3.Sub(vertex3, vertex1);
        const deltaUV1 = Vec2.Sub(uv2, uv1);
        const deltaUV2 = Vec2.Sub(uv3, uv1);
        const det = (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);
        if(Math.abs(det) < 1e-8) return Vec3.Zero();
        const f = 1 / det;
        const tangent = new Vec3();
        tangent.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
        tangent.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
        tangent.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
        return Vec3.Normalize(tangent);
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
            const vertex1 = Vec3.FromArray([
                interleaveArray[index1 + 0],
                interleaveArray[index1 + 1],
                interleaveArray[index1 + 2]
            ]);
            const uv1 = Vec2.FromArray([
                interleaveArray[index1 + 6],
                interleaveArray[index1 + 7]
            ]);
            const vertex2 = Vec3.FromArray([
                interleaveArray[index2 + 0],
                interleaveArray[index2 + 1],
                interleaveArray[index2 + 2]
            ]);
            const uv2 = Vec2.FromArray([
                interleaveArray[index2 + 6],
                interleaveArray[index2 + 7]
            ]);
            const vertex3 = Vec3.FromArray([
                interleaveArray[index3 + 0],
                interleaveArray[index3 + 1],
                interleaveArray[index3 + 2]
            ]);
            const uv3 = Vec2.FromArray([
                interleaveArray[index3 + 6],
                interleaveArray[index3 + 7]
            ]);
            const tangent = MeshHelper.GetTangent(vertex1, vertex2, vertex3, uv1, uv2, uv3);
            tangents[i0][0] += tangent.x;
            tangents[i0][1] += tangent.y;
            tangents[i0][2] += tangent.z;
            tangents[i1][0] += tangent.x;
            tangents[i1][1] += tangent.y;
            tangents[i1][2] += tangent.z;
            tangents[i2][0] += tangent.x;
            tangents[i2][1] += tangent.y;
            tangents[i2][2] += tangent.z;
        }
        for(let i = 0; i < vertexCount; i++){
            let normal = Vec3.FromArray([
                interleaveArray[i * 8 + 3],
                interleaveArray[i * 8 + 4],
                interleaveArray[i * 8 + 5],
            ]);
            normal = Vec3.Normalize(normal);
            let tangent = Vec3.FromArray([
                tangents[i][0],
                tangents[i][1],
                tangents[i][2],
            ]);
            tangent = Vec3.Sub(tangent, Vec3.Scale(normal, Vec3.Dot(normal, tangent)));
            tangent = Vec3.Normalize(tangent);
            tangents[i][0] = tangent.x;
            tangents[i][1] = tangent.y;
            tangents[i][2] = tangent.z;
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
export type ShadingBase = {
    type: "Shading",
    id: string,
    culling: "none" | "back" | "front" | "both",
    transparent: boolean
}
export type SimpleShading = ShadingBase & {
    shaderType: "simple",
    color: Vec3
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
    specular: Vec3,
    shininess: number
}
export type ImageOrColor = { type: "image"; imageRef: string } | { type: "color"; color: Vec3 };
export type ImageOrValue = { type: "image"; imageRef: string } | { type: "value"; value: number };
export type OptionalImage = { type: "image"; imageRef: string } | { type: "none" };
export type Emissive = {
    color: ImageOrColor,
    intensity: number
}
export type PbrShading = ShadingBase & {
    shaderType: "pbr",
    diffuse: ImageOrColor,
    metallic: ImageOrValue,
    roughness: ImageOrValue,
    reflectance: number,
    emissive: Emissive,
    normal: OptionalImage,
    ao: OptionalImage
}
export type GizmoShading = ShadingBase & {
    shaderType: "gizmo",
    color: Vec3
}
export type Shading = SimpleShading | PhongShading | PbrShading | GizmoShading;
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
export type Component = Transform | GizmoTransform | Mesh | Shading | Light | SkyBox | Skeleton;
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
