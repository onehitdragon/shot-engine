import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { FBXInspector } from "./FBXInspector";
import { TextInspector } from "./TextInspector";
import { showInspector } from "../../../../global-state/slices/inspector-slice";
import { selectFocusedEntry, type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import { SceneInspector } from "./SceneInspector";
import { selectFocusedSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { SceneNodeInspector } from "./SceneNodeInspector";
import { AssimpInspector } from "./AssimpInspector";
import { AssetInspector } from "./ImageInspector";

export function InspectorTab(){
    const inspector = useAppSelector((state) => state.inspector.inspector);
    const focusedEntry = useAppSelector(selectFocusedEntry);
    const focusedSceneNode = useAppSelector(selectFocusedSceneNode);
    const scene = useAppSelector(state => state.sceneManager.scene);
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
            const ext = (await window.fsPath.extname(entry.path)).toLowerCase();
            const metaPath = entry.path + ".meta.json";
            if(ext === ".json"){
                try {
                    const jsonObject = JSON.parse(text);
                    if("type" in jsonObject && jsonObject.type === "fbx"){
                        dispatch(showInspector({ inspector: {
                            type: "fbx",
                            fbx: jsonObject.data as FBXFormat.FBX
                        } }));
                    }
                    if("type" in jsonObject && jsonObject.type === "assimp"){
                        dispatch(showInspector({ inspector: {
                            type: "assimp",
                            assimp: jsonObject.data as AssimpFormat.Assimp
                        } }));
                    }
                    else if("type" in jsonObject && jsonObject.type === "scene"){
                        dispatch(showInspector({ inspector: {
                            type: "scene",
                            scene: jsonObject.data as SceneFormat.Scene
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
            else if(await window.api.file.exist(metaPath)){
                const metaObject = JSON.parse(await window.api.file.getText(metaPath));
                dispatch(showInspector({ inspector: {
                    type: "asset",
                    guid: metaObject["guid"],
                    path: entry.path,
                    metaPath: metaPath
                } }));
            }
            else{
                dispatchShowTextInspector(text);
            }
        }
        const handleFocusedSceneNode = (sceneNode: SceneFormat.SceneNode) => {
            if(!scene) return;
            dispatch(showInspector({
                inspector: {
                    type: "scene-node",
                    scene: scene,
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
                inspector.type === "assimp" ? <AssimpInspector inspector={inspector}/> :
                (inspector.type === "scene" && focusedEntry) ? <SceneInspector sceneInspector={inspector} path={focusedEntry.path}/> :
                inspector.type === "scene-node" ? <SceneNodeInspector sceneNodeInspector={inspector}/> :
                inspector.type === "asset" ? <AssetInspector inspector={inspector}/> :
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    This type is not supported in the inspector yet!
                </div>
            }
        </div>
    );
}