import { isAnyOf } from "@reduxjs/toolkit";
import type { AppStartListening } from "../listenerMiddleware";
import { componentsChangedThunk } from "./inspector-components-thunks";
import { nodeFocusedThunk, NodesInfo } from "./go-tree-thunks";
import { updateGizmoToolPosRot } from "../slices/gizmo-go-tree-slice";
import { Mat4 } from "@shot-engine/types";

export function gizmoGoTreeListener(startListening: AppStartListening){
  startListening({
    matcher: isAnyOf(componentsChangedThunk.fulfilled, nodeFocusedThunk.fulfilled),
    effect: (action, { getState, dispatch }) => {
      let nodeId: string | undefined = undefined;
      if(componentsChangedThunk.fulfilled.match(action)){
        const { id } = action.payload;
        nodeId = id;
      }
      if(nodeFocusedThunk.fulfilled.match(action)){
        const { node } = action.meta.arg;
        nodeId = node.id;
      }
      if(!nodeId) return;
      if(nodeId !== getState().gizmoGoTree.nodeTrackInfo?.id) return;
      const nodeWorld = NodesInfo.getInstance().nodeInfos.get(nodeId)?.worldMatrix;
      if(!nodeWorld) return;
      dispatch(updateGizmoToolPosRot({
        pos: Mat4.GetTranslation(nodeWorld),
        rot: Mat4.GetRotation(nodeWorld),
      }));
    }
  });
}
