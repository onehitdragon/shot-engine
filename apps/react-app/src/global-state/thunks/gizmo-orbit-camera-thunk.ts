import { isAnyOf } from "@reduxjs/toolkit";
import type { AppStartListening } from "../listenerMiddleware";
import { updateAspect, updateCamera, type GizmoOrbitCameraState } from "../slices/gizmo-orbit-camera-slice";
import { Mat4, Vec3 } from "@shot-engine/types";
import { sphereCoordinateToCartesian } from "../../pages/main-page/helpers/math-helpers/sphere-coordinate-helpers";

export function gizmoOrbitCameraListener(startListening: AppStartListening){
  startListening({
    matcher: isAnyOf(updateCamera, updateAspect),
    effect: ({  }, { getState }) => {
      const { camera } = getState().gizmoOrbitCamera;
      const [worldPos, forward, viewMat4] = createViewMatrix(camera);
      const clipMat4 = createClipMatrix(camera);
      const vpMat4 = Mat4.Multiply(clipMat4, viewMat4); // P * V
      GizmoOrbitCameraInfo.getInstance().worldPos = worldPos;
      GizmoOrbitCameraInfo.getInstance().forward = forward;
      GizmoOrbitCameraInfo.getInstance().viewMat4 = viewMat4;
      GizmoOrbitCameraInfo.getInstance().clipMat4 = clipMat4;
      GizmoOrbitCameraInfo.getInstance().vpMat4 = vpMat4;
    }
  });
}
export class GizmoOrbitCameraInfo{
  private static _instance: GizmoOrbitCameraInfo;
  public worldPos: Vec3;
  public forward: Vec3;
  public viewMat4: Mat4;
  public clipMat4: Mat4;
  public vpMat4: Mat4;
  public static getInstance(){
    if(!this._instance){
      this._instance = new GizmoOrbitCameraInfo();
    }
    return this._instance;
  }
  private constructor(){
    this.worldPos = Vec3.Zero();
    this.forward = Vec3.Zero();
    this.viewMat4 = new Mat4();
    this.clipMat4 = new Mat4();
    this.vpMat4 = new Mat4();
  }
}
function createViewMatrix(camera: GizmoOrbitCameraState){
  const { sphereCoordinate, origin } = camera;
  const { r, theta, phi } = sphereCoordinate;
  let camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
  camWorldPos = Vec3.Add(origin, camWorldPos);
  const viewMat4 = Mat4.LookAt(camWorldPos, origin, { x: 0, y: 1, z: 0 })
  const forward = Vec3.Normalize(Vec3.Sub(origin, camWorldPos));
  return [camWorldPos, forward, viewMat4] as const;
}
function createClipMatrix(camera: GizmoOrbitCameraState){
  return Mat4.Perspective(camera.fov, camera.aspect, 0.1, 1000);
}
