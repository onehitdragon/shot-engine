import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Vec3 } from "@shot-engine/types"

export interface GizmoOrbitCameraState{
  fov: number,
  aspect: number,
  sphereCoordinate: { r: number, theta: number, phi: number },
  origin: Vec3
}
interface InitState{
  camera: GizmoOrbitCameraState,
  moveable: boolean
}
const initialState:InitState = {
  camera: {
    fov: 45 * Math.PI / 180, // radian
    aspect: 0,
    sphereCoordinate: { r: 5, theta: 0, phi: 0 },
    origin: {x: 0, y: 0, z: 0}
  },
  moveable: true
};

const slice = createSlice({
  initialState,
  name: "gizmo-orbit-camera",
  reducers: {
    updateCamera(state, action: PayloadAction<{ camera: GizmoOrbitCameraState }>){
      state.camera = action.payload.camera;
    },
    updateAspect(state, action: PayloadAction<{ aspect: number }>){
      state.camera.aspect = action.payload.aspect;
    },
    updateMoveable(state, action: PayloadAction<boolean>){
      state.moveable = action.payload;
    },
    updateOrigin(state, action: PayloadAction<{ origin: Vec3 }>){
      state.camera.origin = action.payload.origin;
    },
    updateR(state, action: PayloadAction<{ r: number }>){
      state.camera.sphereCoordinate.r = action.payload.r;
    }
  }
})

export const { updateCamera, updateAspect, updateMoveable, updateOrigin, updateR } = slice.actions;
export const gizmoOrbitCameraReducer =  slice.reducer;
