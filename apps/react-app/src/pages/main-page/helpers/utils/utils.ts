import type { Vec3 } from "@shot-engine/types";
import { clamp } from "lodash";

export function getBaseName(path: string){
    return path.split(/[/\\]/).at(-1) || "";
}
export function getNormalizeColor(color: Vec3): Vec3{
    return {
        x: clamp(color.x, 0, 255) / 255,
        y: clamp(color.y, 0, 255) / 255,
        z: clamp(color.z, 0, 255) / 255,
    };
}
export function getDenormalizeColor(color: Vec3){
    return {
        x: clamp(color.x, 0, 1) * 255,
        y: clamp(color.y, 0, 1) * 255,
        z: clamp(color.z, 0, 1) * 255,
    };
}
