import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import type { NodeState } from "./go-tree-slice";
import { v4 as uuidv4 } from "uuid";
import type { RootState } from "../store";
import { nodeFocusedThunk, nodeUnfocusedThunk } from "../thunks/go-tree-thunks";
import { ComponentHelper, type Component, type GizmoTransform } from "@shot-engine/types";
import { cloneDeep } from "lodash";
import { Quat, Vec3 } from "@shot-engine/math";

const nodeAdapter = createEntityAdapter<NodeState, string>({
  selectId: (node) => node.id
});
interface InitState{
  rootIds: string[],
  nodes: EntityState<NodeState, string>,
  nodeTrackInfo?: {
    id: string
  }
  config: {
    mode: "global" | "local"
  }
}

const gizmoTool = createGizmoTool();
const initialState: InitState = {
  rootIds: [],
  nodes: nodeAdapter.getInitialState(),
  config: {
    mode: "global"
  }
};

const slice = createSlice({
  initialState,
  name: "gizmo-go-tree",
  reducers: {
    updateGizmoToolPosRot(state, action: PayloadAction<{ pos: Vec3, rot: Quat }>){
      if(!state.nodeTrackInfo) return;
      const gizmoToolNode = state.nodes.entities[gizmoTool.rootId];
      if(!gizmoToolNode) return;
      const transform = ComponentHelper.FindComponentByType(gizmoToolNode.components as unknown as Component[], "GizmoTransform");
      if(!transform) return;
      transform.pos = action.payload.pos;
      transform.rot = action.payload.rot;
      if(state.config.mode === "global"){
        transform.rot = gizmoTool.rootTransform.rot;
      }
    },
    updateMode(state, action: PayloadAction<InitState["config"]["mode"]>){
      state.config.mode = action.payload;
    }
  },
  extraReducers(builder){
    builder.addCase(nodeFocusedThunk.fulfilled, (state, action) => {
      const { node } = action.meta.arg;
      state.nodeTrackInfo = {
        id: node.id
      };
      let gizmoToolNode = state.nodes.entities[gizmoTool.rootId];
      if(!gizmoToolNode){
        state.rootIds.push(gizmoTool.rootId);
        nodeAdapter.addMany(state.nodes, cloneDeep(gizmoTool.nodes));
      }
    });
    builder.addCase(nodeUnfocusedThunk.fulfilled, (state) => {
      state.nodeTrackInfo = undefined;
      const index = state.rootIds.findIndex(value => value === gizmoTool.rootId);
      if(index === -1) return;
      state.rootIds.splice(index, 1);
      nodeAdapter.removeMany(state.nodes, gizmoTool.nodeIds);
    });
  }
});

function gizmoUuidv4(){
  return "gizmo-" + uuidv4();
}
function createGizmoTool(){
  const rootId = gizmoUuidv4();
  const rootTransform: GizmoTransform = {
    type: "GizmoTransform",
    id: gizmoUuidv4(),
    pos: Vec3.FromValues(0, 0, 0),
    rot: Quat.FromValues(0, 0, 0, 1),
    scale: Vec3.FromValues(1, 1, 1),
  }
  const root: NodeState = {
    id: rootId,
    name: "root",
    components: [rootTransform],
    childs: [],
  }
  const translate: NodeState = {
    id: gizmoUuidv4(),
    name: "translate",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 0, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1.5, 1.5, 1.5),
        editor: { euler: Vec3.FromValues(0, 0, 0 ) }
      }
    ],
    childs: []
  }
  const axisX: NodeState = {
    id: gizmoUuidv4(),
    name: "axis",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0.5, 0, 0 ),
        rot: Quat.FromValues(0, 0, -0.70710678, 0.70710678 ),
        scale: Vec3.FromValues(0.1, 0.1, 0.1 ),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      }
    ],
    childs: []
  }
  const tailX: NodeState = {
    id: gizmoUuidv4() + "-translateX",
    name: "tail",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 0, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1, 6, 1),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      },
      {
        type: "Mesh",
        id: gizmoUuidv4(),
        meshRef: "cylinder-engine.mesh"
      },
      {
        type: "Shading",
        id: gizmoUuidv4(),
        shaderType: "gizmo",
        culling: "none",
        transparent: false,
        color: Vec3.FromValues(1, 0, 0)
      }
    ],
    childs: []
  }
  const headX: NodeState = {
    id: gizmoUuidv4() + "-translateX",
    name: "head",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 7, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1.5, 1.5, 1.5),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      },
      {
        type: "Mesh",
        id: gizmoUuidv4(),
        meshRef: "cone-engine.mesh"
      },
      {
        type: "Shading",
        id: gizmoUuidv4(),
        shaderType: "gizmo",
        culling: "none",
        transparent: false,
        color: Vec3.FromValues(1, 0, 0)
      }
    ],
    childs: []
  }
  const axisY: NodeState = {
    id: gizmoUuidv4(),
    name: "axis",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 0.5, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(0.1, 0.1, 0.1),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      }
    ],
    childs: []
  }
  const tailY: NodeState = {
    id: gizmoUuidv4() + "-translateY",
    name: "tail",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 0, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1, 6, 1),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      },
      {
        type: "Mesh",
        id: gizmoUuidv4(),
        meshRef: "cylinder-engine.mesh"
      },
      {
        type: "Shading",
        id: gizmoUuidv4(),
        shaderType: "gizmo",
        culling: "none",
        transparent: false,
        color: Vec3.FromValues(0, 1, 0)
      }
    ],
    childs: []
  }
  const headY: NodeState = {
    id: gizmoUuidv4() + "-translateY",
    name: "head",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 7, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1.5, 1.5, 1.5),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      },
      {
        type: "Mesh",
        id: gizmoUuidv4(),
        meshRef: "cone-engine.mesh"
      },
      {
        type: "Shading",
        id: gizmoUuidv4(),
        shaderType: "gizmo",
        culling: "none",
        transparent: false,
        color: Vec3.FromValues(0, 1, 0)
      }
    ],
    childs: []
  }
  const axisZ: NodeState = {
    id: gizmoUuidv4(),
    name: "axis",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 0, 0.5),
        rot: Quat.FromValues(0.70710678, 0, 0, 0.70710678),
        scale: Vec3.FromValues(0.1, 0.1, 0.1),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      }
    ],
    childs: []
  }
  const tailZ: NodeState = {
    id: gizmoUuidv4()  + "-translateZ",
    name: "tail",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 0, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1, 6, 1),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      },
      {
        type: "Mesh",
        id: gizmoUuidv4(),
        meshRef: "cylinder-engine.mesh"
      },
      {
        type: "Shading",
        id: gizmoUuidv4(),
        shaderType: "gizmo",
        culling: "none",
        transparent: false,
        color: Vec3.FromValues(0, 0, 1)
      }
    ],
    childs: []
  }
  const headZ: NodeState = {
    id: gizmoUuidv4() + "-translateZ",
    name: "head",
    components: [
      {
        type: "Transform",
        id: gizmoUuidv4(),
        pos: Vec3.FromValues(0, 7, 0),
        rot: Quat.FromValues(0, 0, 0, 1),
        scale: Vec3.FromValues(1.5, 1.5, 1.5),
        editor: { euler: Vec3.FromValues(0, 0, 0) }
      },
      {
        type: "Mesh",
        id: gizmoUuidv4(),
        meshRef: "cone-engine.mesh"
      },
      {
        type: "Shading",
        id: gizmoUuidv4(),
        shaderType: "gizmo",
        culling: "none",
        transparent: false,
        color: Vec3.FromValues(0, 0, 1)
      }
    ],
    childs: []
  }

  // relationship
  root.childs = [translate.id];
  translate.parent = root.id;
  translate.childs = [axisX.id, axisY.id, axisZ.id];
  axisX.parent = translate.id;
  axisX.childs = [tailX.id, headX.id];
  tailX.parent = axisX.id;
  headX.parent = axisX.id;
  axisY.parent = translate.id;
  axisY.childs = [tailY.id, headY.id];
  tailY.parent = axisY.id;
  headY.parent = axisY.id;
  axisZ.childs = [tailZ.id, headZ.id];
  tailZ.parent = axisZ.id;
  headZ.parent = axisZ.id;

  // result
  const nodes = [root, translate, axisX, tailX, headX, axisY, tailY, headY, axisZ, tailZ, headZ];

  return {
    rootId,
    nodes,
    nodeIds: nodes.map(n => n.id),
    rootTransform
  };
}

export const {
  selectById: selectGizmoNodeById,
  selectEntities: selectGizmoNodeRecord,
  selectAll: selectGizmoNodes
} = nodeAdapter.getSelectors((state: RootState) => state.gizmoGoTree.nodes);

export const { updateGizmoToolPosRot, updateMode } = slice.actions;
export const goTreeGizmoReducer =  slice.reducer;
