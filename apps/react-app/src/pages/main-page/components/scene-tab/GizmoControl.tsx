import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { updateMode } from "../../../../global-state/slices/gizmo-go-tree-slice";

export function GizmoControl(){
  const mode = useAppSelector(state => state.gizmoGoTree.config.mode);
  const dispatch = useAppDispatch();

  return (
    <>
      <button className={`absolute top-1 left-1/2 translate-x-[-105%]
        cursor-pointer p-1 rounded ${mode === "global" ? "bg-slate-400" : "bg-slate-700"} flex`}
        onClick={() => { dispatch(updateMode("global")) }}>
        <span className="text-xs text-white">Global</span>
      </button>
      <button className={`absolute top-1 left-1/2 translate-x-[5%]
        cursor-pointer p-1 rounded ${mode === "local" ? "bg-slate-400" : "bg-slate-700"} flex`}
        onClick={() => { dispatch(updateMode("local")) }}>
        <span className="text-xs text-white">Local</span>
      </button>
    </>
  );
}