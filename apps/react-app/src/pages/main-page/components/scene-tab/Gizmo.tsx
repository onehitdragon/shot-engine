import { useEffect, useRef } from "react";
import { GizmoOrbitCameraInfo } from "../../../../global-state/thunks/gizmo-orbit-camera-thunk";
import { nodeFocusedThunk, NodesInfo, nodeUnfocusedThunk } from "../../../../global-state/thunks/go-tree-thunks";
import { GlobalSceneNodeRenderer } from "./SceneRenderer";
import { ComponentHelper, Mat3, Mat4, Ray, Vec3 } from "@shot-engine/types";
import { getSceneCanvas } from "../../helpers/resource-manager-helper/CanvasHelper";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { selectNodeRecord } from "../../../../global-state/slices/go-tree-slice";
import { updateMoveable } from "../../../../global-state/slices/gizmo-orbit-camera-slice";
import { cloneDeep } from "lodash";
import { componentUpdatedThunk } from "../../../../global-state/thunks/inspector-components-thunks";

export function Gizmo(){
  const dispatch = useAppDispatch();
  const nodeRecord = useAppSelector(state => selectNodeRecord(state));
  const gizmoNodeId = useAppSelector(state => state.gizmoGoTree.nodeTrackInfo?.id);
  const mode = useAppSelector(state => state.gizmoGoTree.config.mode);
  const latestProps = useRef({ nodeRecord, gizmoNodeId, mode, dispatch });
  useEffect(() => {
    latestProps.current = { nodeRecord, gizmoNodeId, mode, dispatch };
  }, [nodeRecord, gizmoNodeId, mode, dispatch]);

  useEffect(() => {
    let intersect: { nodeId: string, point: Vec3 } | null = null;
    let gizmoIntersect: { nodeId: string, point: Vec3 } | null = null;
    let moved = false;
    let mouseDown = false;
    function reset(){
      intersect = null;
      gizmoIntersect = null;
      moved = false;
      mouseDown = false;
      dispatch(updateMoveable(true));
    }
    function getRay(e: MouseEvent){
      const canvas = getSceneCanvas();
      const rect = canvas.getBoundingClientRect();
      return Ray.FromView(
        rect.width, rect.height, e.clientX - rect.left, e.clientY - rect.top,
        GizmoOrbitCameraInfo.getInstance().vpMat4
      );
    }
    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      const target = e.target as HTMLElement | null;
      if(target?.closest("#scene-canvas")){
        const viewRay = getRay(e);
        rayPick(
          viewRay,
          (nodeId, point) => {
            intersect = { nodeId, point };
          },
          (nodeId, point) => {
            gizmoIntersect = { nodeId, point };
          }
        );
      }
    }
    const onMouseMove = (e: MouseEvent) => {
      if(!mouseDown) return;
      const dis = e.movementX * e.movementX + e.movementY * e.movementY;
      if(dis > 9) moved = true;
      if(!gizmoIntersect) return;

      let translate: "x" | "y" | "z" | undefined = undefined;
      if(gizmoIntersect.nodeId.includes("translateX")) translate = "x";
      else if(gizmoIntersect.nodeId.includes("translateY")) translate = "y";
      else if(gizmoIntersect.nodeId.includes("translateZ")) translate = "z";
      if(translate){
        dispatch(updateMoveable(false));
        const ray = getRay(e);
        const t = ray.intersectPlane(gizmoIntersect.point, GizmoOrbitCameraInfo.getInstance().forward);
        if(!t) return;
        const movedPoint = ray.getPoint(t);
        const moveDir = Vec3.Sub(movedPoint, gizmoIntersect.point);
        gizmoIntersect.point = movedPoint;
        const gizmoNodeId = latestProps.current.gizmoNodeId;
        if(!gizmoNodeId) return;

        let localAxis: Vec3;
        const parentWorldMatrix = NodesInfo.getInstance().nodeInfos.get(gizmoNodeId)?.parentWorldMatrix;
        if(!parentWorldMatrix) return;
        const parentWorldMatrixInvert = Mat3.FromMat4(Mat4.Invert(parentWorldMatrix));
        if(latestProps.current.mode === "global"){
          const axis = Vec3.Axis(translate);
          const distance = Vec3.Dot(moveDir, axis);
          const worldDelta = Vec3.Scale(axis, distance);
          localAxis = Vec3.TransformMat3(worldDelta, parentWorldMatrixInvert);
        }
        else{
          const worldMatrix = NodesInfo.getInstance().nodeInfos.get(gizmoNodeId)?.worldMatrix;
          if(!worldMatrix) return;
          const axis = Vec3.Normalize(Mat4.GetAxis(worldMatrix, translate));
          const distance = Vec3.Dot(moveDir, axis);
          const worldDelta = Vec3.Scale(axis, distance);
          localAxis = Vec3.TransformMat3(worldDelta, parentWorldMatrixInvert);
        }

        const components = latestProps.current.nodeRecord[gizmoNodeId].components;
        const transform = ComponentHelper.FindComponentByType(components, "Transform");
        if(!transform) return;
        const transformClone = cloneDeep(transform);
        transformClone.pos = Vec3.Add(transformClone.pos, localAxis);
        dispatch(componentUpdatedThunk({ component: transformClone }));
      }
    }
    const onMouseUp = (e: MouseEvent) => {
      if(gizmoIntersect || moved){
        reset();
        return;
      }
      if(intersect){
        dispatch(nodeFocusedThunk({ node: latestProps.current.nodeRecord[intersect.nodeId] }));
        reset();
        return;
      }
      reset();

      const target = e.target as HTMLElement | null;
      if(target?.closest("#scene-node-selected")) return;
      if(target?.closest("#inspector")) return;
      if(target?.closest("#context-menu")) return;
      if(target?.closest("#go-non-selected")) return;
      if(target?.closest("#node-name-editing-input")) return;
      dispatch(nodeUnfocusedThunk());
    }

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    }
  }, []);

  return <></>
}

export function rayPick(
  viewRay: Ray,
  onPick?: (id: string, intersectPoint: Vec3) => void,
  onGizmoPick?: (id: string, intersectPoint: Vec3) => void,
){
  let minDis = Infinity;
  let minId: string | null = null;
  let gizmoDis = Infinity;
  let gizmoMinId: string | null = null;
  for(const [id, nodeInfo] of GlobalSceneNodeRenderer.getInstance().nodeRenderInfos.entries()){
    const { meshAsset } = nodeInfo;
    if(!meshAsset) continue;
    const modelMat4 = NodesInfo.getInstance().nodeInfos.get(id)?.worldMatrix;
    if(!modelMat4) continue;
    const localRay = Ray.TransformSpace(viewRay, modelMat4);

    for(const { aabb, indices, attribute } of meshAsset.primitives){
      if(!localRay.aabbIntersect(aabb)){
        continue;
      }
      for(let i = 0; i < indices.length; i += 3){
        const v0_index = indices[i] * 11; // (3 verter, 3 normal, 2 uv, 3 tangent)
        const v1_index = indices[i + 1] * 11;
        const v2_index = indices[i + 2] * 11;
        const v0 = new Vec3();
        v0.x = attribute.interleaveArray[v0_index];
        v0.y = attribute.interleaveArray[v0_index + 1];
        v0.z = attribute.interleaveArray[v0_index + 2];
        const v1 = new Vec3();
        v1.x = attribute.interleaveArray[v1_index];
        v1.y = attribute.interleaveArray[v1_index + 1];
        v1.z = attribute.interleaveArray[v1_index + 2];
        const v2 = new Vec3();
        v2.x = attribute.interleaveArray[v2_index];
        v2.y = attribute.interleaveArray[v2_index + 1];
        v2.z = attribute.interleaveArray[v2_index + 2];
        const distance = localRay.trigIntersect(v0, v1, v2);
        if(distance === false) continue;

        if(id.startsWith("gizmo")){
          if(distance < gizmoDis){
            gizmoDis = distance;
            gizmoMinId = id;
          }
        }
        else{
          if(distance < minDis){
            minDis = distance;
            minId = id;
          }
        }
      }
    }
  }

  if(minId){
    onPick?.(minId, viewRay.getPoint(minDis));
  }
  if(gizmoMinId){
    onGizmoPick?.(gizmoMinId, viewRay.getPoint(gizmoDis));
  }
}
