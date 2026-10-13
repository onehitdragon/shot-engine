import { Vec3, clamp } from "@shot-engine/math";

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
