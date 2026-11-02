import type { AppStartListening } from "../listenerMiddleware";
import { type GizmoOrbitCameraState } from "../slices/gizmo-orbit-camera-slice";
import { sphereCoordinateToCartesian } from "../../pages/main-page/helpers/math-helpers/sphere-coordinate-helpers";
import { Mat4, Vec3 } from "@shot-engine/math";

export function gizmoOrbitCameraListener(startListening: AppStartListening){
  startListening({
    predicate: (_, curState, oldState) => {
      return (curState.gizmoOrbitCamera.camera !== oldState.gizmoOrbitCamera.camera)
    },
    effect: ({  }, { getState }) => {
      const { camera } = getState().gizmoOrbitCamera;
      const [worldPos, forward, viewMat4] = createViewMatrix(camera);
      const clipMat4 = createClipMatrix(camera);
      const vpMat4 = Mat4.Multiply(new Mat4(), clipMat4, viewMat4); // P * V
      GizmoOrbitCameraInfo.getInstance().camera = { ...camera };
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
  public camera: { near: number, far: number, fov: number, aspect: number };
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
    this.camera = { near: 0, far: 0, fov: 0, aspect: 0 };
    this.worldPos = Vec3.Zero(new Vec3());
    this.forward = Vec3.Zero(new Vec3());
    this.viewMat4 = new Mat4();
    this.clipMat4 = new Mat4();
    this.vpMat4 = new Mat4();
  }
}
function createViewMatrix(camera: GizmoOrbitCameraState){
  const { sphereCoordinate, origin } = camera;
  const { r, theta, phi } = sphereCoordinate;
  const camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
  Vec3.Add(camWorldPos, camWorldPos, origin);
  const viewMat4 = Mat4.LookAt(new Mat4(), camWorldPos, origin, Vec3.FromValues(0, 1, 0))
  const forward = Vec3.Normalize(new Vec3(), Vec3.Sub(new Vec3(), origin, camWorldPos));
  return [camWorldPos, forward, viewMat4] as const;
}
function createClipMatrix(camera: GizmoOrbitCameraState){
  return Mat4.Perspective(new Mat4(), camera.fov, camera.aspect, camera.near, camera.far);
}
