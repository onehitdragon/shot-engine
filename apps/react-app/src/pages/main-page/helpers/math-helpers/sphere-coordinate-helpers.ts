import { radians } from "@math.gl/core";
import { Vec3 } from "@shot-engine/types";

export function sphereCoordinateToCartesian(r: number, theta: number, phi: number){
    theta = radians(theta);
    phi = radians(phi);
    const x = r * Math.cos(phi) * Math.sin(theta);
    const y = r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.cos(theta);
    return Vec3.FromArray([x, y, z]);
}