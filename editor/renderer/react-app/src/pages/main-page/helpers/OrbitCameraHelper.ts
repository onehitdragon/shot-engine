import { mat4, vec3 } from "gl-matrix";
import { sphereCoordinateToCartesian } from "./math-helpers/sphere-coordinate-helpers";

export class OrbitCameraHelper{
    static createViewMatrix(camera: SceneFormat.SceneOrbitCamera){
        const { sphereCoordinate, origin } = camera;
        const { r, theta, phi } = sphereCoordinate;
        const camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
        vec3.add(camWorldPos, origin, camWorldPos);
        const viewMat4 = mat4.create();
        mat4.lookAt(viewMat4, camWorldPos, origin, [0, 1, 0]);
        return viewMat4;
    }
    static createClipMatrix(camera: SceneFormat.SceneOrbitCamera){
        const clipMat4 = mat4.create();
        mat4.perspective(clipMat4, 45 * Math.PI / 180, camera.aspect, 1, 100);
        return clipMat4;
    }
    static createVPMatrix(camera: SceneFormat.SceneOrbitCamera){
        const vpMat4 = mat4.create();
        mat4.multiply(vpMat4, this.createClipMatrix(camera), this.createViewMatrix(camera));
        return vpMat4;
    }
}