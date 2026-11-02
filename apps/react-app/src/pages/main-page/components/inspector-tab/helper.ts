import { Vec3, Vec4, clamp } from "@shot-engine/math";

// vec3
export function Vec3ToObject(vec3: Vec3){
  return { x: vec3.values[0], y: vec3.values[1], z: vec3.values[2] }
}
export function ObjectToVec3(obj: { x: number, y: number, z: number }){
  return Vec3.FromValues(obj.x, obj.y, obj.z);
}
export function Vec3ToColor(vec3: Vec3){
  return {
    x: clamp(parseInt(vec3.values[0] * 255 + ""), 0, 255),
    y: clamp(parseInt(vec3.values[1] * 255 + ""), 0, 255),
    z: clamp(parseInt(vec3.values[2] * 255 + ""), 0, 255)
  };
}
export function ColorToVec3(obj: { x: number, y: number, z: number }){
  return Vec3.FromValues(
    clamp(obj.x / 255, 0, 1),
    clamp(obj.y / 255, 0, 1),
    clamp(obj.z / 255, 0, 1)
  );
}
export function Vec3ToFixedString(vec3: Vec3, fractionDigits = 2){
  return `${vec3.values[0].toFixed(fractionDigits)}, 
  ${vec3.values[1].toFixed(fractionDigits)}, 
  ${vec3.values[2].toFixed(fractionDigits)}`;
}
export function Vec3ToRGBString(vec3: Vec3){
  return `rgb(${vec3.values[0] * 255},${vec3.values[1] * 255},${vec3.values[2] * 255})`;
}
// vec4
export function Vec4ToObject(vec4: Vec4){
  return { x: vec4.values[0], y: vec4.values[1], z: vec4.values[2], w: vec4.values[3] }
}
export function ObjectToVec4(obj: { x: number, y: number, z: number, w: number }){
  return Vec4.FromValues(obj.x, obj.y, obj.z, obj.w);
}
export function Vec4ToColor(vec4: Vec4){
  return {
    x: clamp(parseInt(vec4.values[0] * 255 + ""), 0, 255),
    y: clamp(parseInt(vec4.values[1] * 255 + ""), 0, 255),
    z: clamp(parseInt(vec4.values[2] * 255 + ""), 0, 255),
    w: clamp(parseInt(vec4.values[3] * 255 + ""), 0, 255)
  };
}
export function ColorToVec4(obj: { x: number, y: number, z: number, w: number }){
  return Vec4.FromValues(
    clamp(obj.x / 255, 0, 1),
    clamp(obj.y / 255, 0, 1),
    clamp(obj.z / 255, 0, 1),
    clamp(obj.w / 255, 0, 1)
  );
}
