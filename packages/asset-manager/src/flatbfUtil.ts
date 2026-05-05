import type * as ShotEngineType from "@shot-engine/types";
import { Vec3 } from "../fbs-gen/fbsengine";

type CullingType = ShotEngineType.Shading["culling"];
const CULLINGS = new Set<CullingType>(["none", "back", "front", "both"]);
export function getCulling(culling?: string | null){
    if(typeof culling === "string" && CULLINGS.has(culling as CullingType)){
        return culling as CullingType;
    }
    return "none";
}
export function getVec3(vec3?: Vec3 | null): ShotEngineType.Vec3{
    if(!vec3) return { x: 0, y: 0, z: 0 };
    return {
        x: vec3.x(),
        y: vec3.y(),
        z: vec3.z()
    }
}
