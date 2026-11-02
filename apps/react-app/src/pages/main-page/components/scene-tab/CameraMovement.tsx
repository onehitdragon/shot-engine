import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { sphereCoordinateToCartesian } from "../../helpers/math-helpers/sphere-coordinate-helpers";
import { updateAspect, updateCamera } from "../../../../global-state/slices/gizmo-orbit-camera-slice";
import { clamp } from "lodash";
import { getSceneCanvas, getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { Vec3 } from "@shot-engine/math";

export function CameraMovement(){
  const [mode, setMode] = useState(0); // 0 idle 1 moving 2 rotating
  const camera = useAppSelector(state => state.gizmoOrbitCamera.camera);
  const moveable = useAppSelector(state => state.gizmoOrbitCamera.moveable);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if(target?.closest("#scene-canvas")){
        if(e.altKey && e.shiftKey) setMode(1);
        if(e.altKey && !e.shiftKey) setMode(2);
      }
    }
    const onMouseUp = () => {
      setMode(0);
    }

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    }
  }, []);

  useEffect(() => {
    if(mode === 0) return;
    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.movementX;
      const deltaY = e.movementY;
      if(mode === 1){
        if(!moveable) return;
        const { r, theta, phi } = camera.sphereCoordinate;
        const camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
        Vec3.Add(camWorldPos, camWorldPos, camera.origin);
        const forward = Vec3.Sub(new Vec3(), camera.origin, camWorldPos);
        const right = Vec3.Cross(new Vec3(), forward, Vec3.FromValues(0, 1, 0));
        const up = Vec3.Cross(new Vec3(), right, forward);
        Vec3.Normalize(forward, forward);
        Vec3.Normalize(right, right);
        Vec3.Normalize(up, up);
        const origin = Vec3.Add(new Vec3(), camera.origin, Vec3.Scale(new Vec3(), right, -deltaX * 0.05));
        Vec3.Add(origin, origin, Vec3.Scale(up, up, deltaY * 0.05));
        dispatch(updateCamera({ camera: { ...camera, origin } }));
      }
      else if(mode === 2){
        let { theta, phi } = camera.sphereCoordinate;
        theta -= deltaX * 0.15;
        phi += deltaY * 0.15;
        phi = clamp(phi, -89, 89);
        dispatch(updateCamera({ camera: {
          ...camera,
          sphereCoordinate: { ...camera.sphereCoordinate, theta, phi }
        }}));
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    return () =>{
      window.removeEventListener("mousemove", onMouseMove);
    }
  }, [mode, camera, moveable]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if(target?.closest("#scene-canvas")){
        const dir = Math.sign(e.deltaY);
        let r = camera.sphereCoordinate.r + dir * 0.5;
        r = Math.max(r, 1);
        dispatch(updateCamera({ camera: {
          ...camera,
          sphereCoordinate: { ...camera.sphereCoordinate, r }
        }}));
      }
    }
    
    window.addEventListener("wheel", onWheel);
    return () =>{
      window.removeEventListener("wheel", onWheel);
    }
  }, [camera]);

  useEffect(() => {
    const webgl2 = getSceneWebglContext();
    const canvas = getSceneCanvas();
    const observer = new ResizeObserver((entries) => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = entries[0].contentRect;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      webgl2.viewport(0, 0, canvas.width, canvas.height);
      dispatch(updateAspect({ aspect: width / height }));
    });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
    }
  }, []);

  return <></>
}