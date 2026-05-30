import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { TextAssetInspector } from "./TextAssetInspector";
import { showInspector } from "../../../../global-state/slices/inspector-slice";
import { ImageAssetInspector } from "./ImageAssetInspector";
import { MeshAssetInspector } from "./MeshAssetInspector";
import { ComponentsInspector } from "./ComponentsInspector";
import { PrefabAssetInspector } from "./PrefabAssetInspector";
import { SceneAssetInspector } from "./SceneAssetInspector";
import { HdrAssetInspector } from "./HdrAssetInspector";

export function InspectorTab(){
    const inspector = useAppSelector((state) => state.inspector.inspector);
    const dispatch = useAppDispatch();
    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if(event.button !== 0) return;
            const target = event.target as HTMLElement | null;
            if(!target) return;
            if(target.closest("#inspector")) return;
            if(target.closest("#context-menu")) return;
            dispatch(showInspector({ inspector: null }));
        }
        window.addEventListener("mousedown", handler);
        return () => window.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div id="inspector" className="flex flex-1 overflow-hidden">
            {
                (!inspector) ?
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                </div>
                :
                inspector.type === "text" ? <TextAssetInspector textInspector={inspector}/> :
                inspector.type === "image" ? <ImageAssetInspector inspector={inspector}/> :
                inspector.type === "mesh" ? <MeshAssetInspector inspector={inspector}/> :
                inspector.type === "components" ? <ComponentsInspector /> :
                inspector.type === "prefab" ? <PrefabAssetInspector inspector={inspector}/> :
                inspector.type === "scene" ? <SceneAssetInspector inspector={inspector}/> :
                inspector.type === "hdr" ? <HdrAssetInspector inspector={inspector}/> :
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    This type is not supported in the inspector yet!
                </div>
            }
        </div>
    );
}