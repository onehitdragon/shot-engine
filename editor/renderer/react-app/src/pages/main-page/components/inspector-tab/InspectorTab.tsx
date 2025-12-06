import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { FBXInspector } from "./FBXInspector";
import { TextInspector } from "./TextInspector";
import { showInspector } from "../../../../global-state/slices/inspector-slice";
import { selectFocusedEntry } from "../../../../global-state/slices/folder-manager-slice";
import { NoSymbolIcon
} from '@heroicons/react/24/solid';
import path from "path-browserify";
import { SceneInspector } from "./SceneInspector";

export function InspectorTab(){
    const inspector = useAppSelector((state) => state.inspector.inspector);
    const focused = useAppSelector(selectFocusedEntry);
    const dispatch = useAppDispatch();
    
    const dispatchShowTextInspector = (text: string) => {
        dispatch(showInspector({ inspector: {
            type: "text",
            content: text
        } }));
    }
    useEffect(() => {
        const handle = async () => {
            if(!focused || focused.type == "Directory"){
                dispatch(showInspector({ inspector: null }));
                return;
            }
            const text = await window.api.file.getText(focused.path);
            const ext = path.extname(focused.path).toLowerCase();
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
        handle();
    }, [focused])

    return (
        <div id="inspector" className="flex flex-1 overflow-hidden">
            {
                (!inspector || !focused) ?
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    <NoSymbolIcon className="size-8"/>
                </div>
                :
                inspector.type === "text" ? <TextInspector textInspector={inspector}/> :
                inspector.type === "fbx" ? <FBXInspector fbxInspector={inspector}/> :
                inspector.type === "scene" ? <SceneInspector sceneInspector={inspector} path={focused.path}/> :
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    This type is not supported in the inspector yet!
                </div>
            }
        </div>
    );
}