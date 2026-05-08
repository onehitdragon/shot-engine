import type { Vec3 } from "@shot-engine/types";

export function getBaseName(path: string){
    return path.split(/[/\\]/).at(-1) || "";
}
export function getNormalizeColor(color: Vec3): Vec3{
    return {
        x: color.x / 255,
        y: color.y / 255,
        z: color.z / 255,
    };
}
export function getDenormalizeColor(color: Vec3){
    return {
        x: color.x * 255,
        y: color.y * 255,
        z: color.z * 255,
    };
}
