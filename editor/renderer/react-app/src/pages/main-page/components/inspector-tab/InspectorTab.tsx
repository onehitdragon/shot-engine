import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { FBXInspector } from "./FBXInspector";
import { TextInspector } from "./TextInspector";
import { showInspector } from "../../../../global-state/slices/inspector-slice";
import { selectFocusedEntry, type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import path from "path-browserify";
import { SceneInspector } from "./SceneInspector";
import { selectFocusedSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { SceneNodeInspector } from "./SceneNodeInspector";

export function InspectorTab(){
    const inspector = useAppSelector((state) => state.inspector.inspector);
    const focusedEntry = useAppSelector(selectFocusedEntry);
    const focusedSceneNode = useAppSelector(selectFocusedSceneNode);
    const dispatch = useAppDispatch();
    
    const dispatchShowTextInspector = (text: string) => {
        dispatch(showInspector({ inspector: {
            type: "text",
            content: text
        } }));
    }
    useEffect(() => {
        let active = true;
        const handleFocusedEntry = async (entry: FolderManager.DirectoryState | DirectoryTree.File) => {
            if(entry.type == "Directory"){
                dispatch(showInspector({ inspector: null }));
                return;
            }
            const text = await window.api.file.getText(entry.path);
            if(!active) return;
            const ext = path.extname(entry.path).toLowerCase();
            if(ext === ".json"){
                try {
                    const jsonObject = JSON.parse(text);
                    if("type" in jsonObject && jsonObject.type === "fbx"){
                        dispatch(showInspector({ inspector: {
                            type: "fbx",
                            fbx: jsonObject.data as FBXFormat.FBX
                        } }));
                    }
                    else if("type" in jsonObject && jsonObject.type === "scene"){
                        dispatch(showInspector({ inspector: {
                            type: "scene",
                            sceneGraph: jsonObject.data as SceneFormat.SceneGraph
                        } }));
                    }
                    else{
                        dispatchShowTextInspector(text);
                    }
                }
                catch(err){
                    dispatchShowTextInspector(text);
                }
            }
            else{
                dispatchShowTextInspector(text);
            }
        }
        const handleFocusedSceneNode = (sceneNode: SceneFormat.SceneNode) => {
            dispatch(showInspector({
                inspector: {
                    type: "scene-node",
                    node: sceneNode
                }
            }));
        }
        const handle = async () => {
            if(focusedEntry) await handleFocusedEntry(focusedEntry);
            else if(focusedSceneNode) handleFocusedSceneNode(focusedSceneNode);
            else dispatch(showInspector({ inspector: null }));
        }
        handle();
        return () => {
            active = false;
        }
    }, [focusedEntry, focusedSceneNode])

    return (
        <div id="inspector" className="flex flex-1 overflow-hidden">
            {
                (!inspector) ?
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                </div>
                :
                inspector.type === "text" ? <TextInspector textInspector={inspector}/> :
                inspector.type === "fbx" ? <FBXInspector fbxInspector={inspector}/> :
                (inspector.type === "scene" && focusedEntry) ? <SceneInspector sceneInspector={inspector} path={focusedEntry.path}/> :
                inspector.type === "scene-node" ? <SceneNodeInspector sceneNodeInspector={inspector}/> :
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    This type is not supported in the inspector yet!
                </div>
            }
        </div>
    );
}