import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { FBXInspector } from "./FBXInspector";
import { TextInspector } from "./TextInspector";
import { showInspector } from "../../../../global-state/slices/inspector-slice";
import { SceneInspector } from "./SceneInspector";
import { selectFocusedSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { SceneNodeInspector } from "./SceneNodeInspector";
import { PrefabInspector } from "./PrefabInspector";
import { AssetInspector } from "./ImageInspector";
import { MeshInspector } from "./MeshInspector";

export function InspectorTab(){
    const inspector = useAppSelector((state) => state.inspector.inspector);
    const focusedSceneNode = useAppSelector(selectFocusedSceneNode);
    const scene = useAppSelector(state => state.sceneManager.scene);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if(focusedSceneNode && scene){
            dispatch(showInspector({
                inspector: {
                    type: "scene-node",
                    scene: scene,
                    node: focusedSceneNode
                }
            }));
        }
    }, [focusedSceneNode, scene]);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if(!target) return;
            if(target.closest("#inspector")) return;
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
                inspector.type === "text" ? <TextInspector textInspector={inspector}/> :
                inspector.type === "fbx" ? <FBXInspector fbxInspector={inspector}/> :
                inspector.type === "mesh" ? <MeshInspector inspector={inspector}/> :
                inspector.type === "prefab" ? <PrefabInspector inspector={inspector}/> :
                inspector.type === "scene" ? <SceneInspector sceneInspector={inspector}/> :
                inspector.type === "scene-node" ? <SceneNodeInspector sceneNodeInspector={inspector}/> :
                inspector.type === "asset" ? <AssetInspector inspector={inspector}/> :
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    This type is not supported in the inspector yet!
                </div>
            }
        </div>
    );
}