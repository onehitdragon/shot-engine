import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { sphereCoordinateToCartesian } from "../../helpers/math-helpers/sphere-coordinate-helpers";
import { Vec3 } from "@shot-engine/types";
import { updateAspect, updateCamera } from "../../../../global-state/slices/gizmo-orbit-camera-slice";
import { clamp } from "lodash";
import { getSceneCanvas, getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";

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
        let camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
        camWorldPos = Vec3.Add(camera.origin, camWorldPos);
        let forward = Vec3.Sub(camera.origin, camWorldPos);
        let right = Vec3.Cross(forward, Vec3.Up());
        let up = Vec3.Cross(right, forward);
        forward = Vec3.Normalize(forward);
        right = Vec3.Normalize(right);
        up = Vec3.Normalize(up);
        let origin = Vec3.Add(camera.origin, Vec3.Scale(right, -deltaX * 0.05));
        origin = Vec3.Add(origin, Vec3.Scale(up, deltaY * 0.05));
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