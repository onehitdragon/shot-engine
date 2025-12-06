import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { FBXInspector } from "./FBXInspector";
import { TextInspector } from "./TextInspector";
import { showInspector } from "../../../../global-state/slices/inspector-slice";
import { selectFocusedEntry } from "../../../../global-state/slices/folder-manager-slice";
import { NoSymbolIcon
} from '@heroicons/react/24/solid';
import path from "path-browserify";

export function InspectorTab(){
    const inspector = useAppSelector((state) => state.inspector.inspector);
    const focused = useAppSelector(selectFocusedEntry);
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        const handle = async () => {
            if(!focused || focused.type == "Directory"){
                dispatch(showInspector({ inspector: null }));
                return;
            }
            const text = await window.api.file.getText(focused.path);
            const ext = path.extname(focused.path).toLowerCase();
            if(ext === ".json"){
                const jsonObject = JSON.parse(text);
                if("type" in jsonObject && jsonObject.type == "fbx"){
                    console.log("ok");
                }
                else{
                    dispatch(showInspector({ inspector: {
                        type: "text",
                        content: text
                    } }));
                }
            }
            else{
                dispatch(showInspector({ inspector: {
                    type: "text",
                    content: text
                } }));
            }
        }
        handle();
    }, [focused])

    return (
        <div id="inspector" className="flex flex-1 overflow-hidden">
            {
                !inspector ?
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    <NoSymbolIcon className="size-8"/>
                </div>
                :
                inspector.type === "text" ? <TextInspector textInspector={inspector}/> :
                inspector.type === "fbx" ? <FBXInspector fbxInspector={inspector}/> :
                <div className="flex items-center justify-center flex-1 text-white text-sm">
                    Haven't supported this type in inspector!
                </div>
            }
        </div>
    );
}