import { useEffect, useRef } from "react";
import { GizmoOrbitCameraInfo } from "../../../../global-state/thunks/gizmo-orbit-camera-thunk";
import { nodeFocusedThunk, NodesInfo, nodeUnfocusedThunk } from "../../../../global-state/thunks/go-tree-thunks";
import { GlobalSceneNodeRenderer } from "./SceneRenderer";
import { ComponentHelper, MeshAssetHelper, Ray } from "@shot-engine/types";
import { getSceneCanvas } from "../../helpers/resource-manager-helper/CanvasHelper";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { selectNodeRecord } from "../../../../global-state/slices/go-tree-slice";
import { updateMoveable } from "../../../../global-state/slices/gizmo-orbit-camera-slice";
import { cloneDeep } from "lodash";
import { componentUpdatedThunk } from "../../../../global-state/thunks/inspector-components-thunks";
import { Mat3, Mat4, Vec3 } from "@shot-engine/math";

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
        const moveDir = Vec3.Sub(new Vec3(), movedPoint, gizmoIntersect.point);
        gizmoIntersect.point = movedPoint;
        const gizmoNodeId = latestProps.current.gizmoNodeId;
        if(!gizmoNodeId) return;

        let localAxis: Vec3;
        const parentWorldMatrix = NodesInfo.getInstance().nodeInfos.get(gizmoNodeId)?.parentWorldMatrix;
        if(!parentWorldMatrix) return;
        Mat4.Invert(parentWorldMatrix, parentWorldMatrix);
        const parentWorldMatrixInvert = Mat3.FromMat4(new Mat3(), parentWorldMatrix);
        if(latestProps.current.mode === "global"){
          const axis = Vec3.FromAxis(translate);
          const distance = Vec3.Dot(moveDir, axis);
          const worldDelta = Vec3.Scale(axis, axis, distance);
          localAxis = Vec3.TransformMat3(worldDelta, worldDelta, parentWorldMatrixInvert);
        }
        else{
          const worldMatrix = NodesInfo.getInstance().nodeInfos.get(gizmoNodeId)?.worldMatrix;
          if(!worldMatrix) return;
          const axis = Mat4.GetAxis(worldMatrix, translate);
          Vec3.Normalize(axis, axis);
          const distance = Vec3.Dot(moveDir, axis);
          const worldDelta = Vec3.Scale(axis, axis, distance);
          localAxis = Vec3.TransformMat3(worldDelta, worldDelta, parentWorldMatrixInvert);
        }

        const components = latestProps.current.nodeRecord[gizmoNodeId].components;
        const transform = ComponentHelper.FindComponentByType(components, "Transform");
        if(!transform) return;
        const transformClone = cloneDeep(transform);
        Vec3.Add(transformClone.pos, transformClone.pos, localAxis);
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

    for(const { indices, indexType, aabb, attribute } of meshAsset.primitives){
      const { position, normal, uv, tangent, joint, weight } = attribute;
      const indicesTyped = MeshAssetHelper.getIndicesTypedArray(indices, indexType);
      const itemSizeInByte = position.itemSize + normal.itemSize + uv.itemSize + tangent.itemSize + joint.itemSize + weight.itemSize;
      const interleaveView = new DataView(attribute.interleaveArray.buffer);
      const littleEndian = true;
      if(!localRay.aabbIntersect(aabb)){
        continue;
      }
      for(let i = 0; i < indicesTyped.length; i += 3){
        const v0_offset = indicesTyped[i] * itemSizeInByte;
        const v1_offset = indicesTyped[i + 1] * itemSizeInByte;
        const v2_offset = indicesTyped[i + 2] * itemSizeInByte;
        const v0 = new Vec3();
        v0.values[0] = interleaveView.getFloat32(v0_offset, littleEndian);
        v0.values[1] = interleaveView.getFloat32(v0_offset + 4, littleEndian);
        v0.values[2] = interleaveView.getFloat32(v0_offset + 8, littleEndian);
        const v1 = new Vec3();
        v1.values[0] = interleaveView.getFloat32(v1_offset, littleEndian);
        v1.values[1] = interleaveView.getFloat32(v1_offset + 4, littleEndian);
        v1.values[2] = interleaveView.getFloat32(v1_offset + 8, littleEndian);
        const v2 = new Vec3();
        v2.values[0] = interleaveView.getFloat32(v2_offset, littleEndian);
        v2.values[1] = interleaveView.getFloat32(v2_offset + 4, littleEndian);
        v2.values[2] = interleaveView.getFloat32(v2_offset + 8, littleEndian);
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
