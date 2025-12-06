import { CubeIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronRightIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { useDispatch } from "react-redux";
import { updateSceneModified, updateScenePath } from "../../../../global-state/slices/scene-manager-slice";

export function SceneGraph(props: { sceneGraph: SceneFormat.SceneGraph }){
    const { sceneGraph } = props;
    const { name, nodes } = sceneGraph;
    const modified = useAppSelector(state => state.sceneManager.modified);
    const path = useAppSelector(state => state.sceneManager.path);
    const dispatch = useDispatch();

    useEffect(() => {
        const handler = async (e: KeyboardEvent) => {
            if(e.ctrlKey && e.key == "s"){
                if(!modified) return;
                const jsonImportFile: Importer.JsonImportFile = {
                    type: "scene",
                    data: sceneGraph
                }
                const json = JSON.stringify(jsonImportFile, null, 2);
                if(!path){
                    const savedPath = await window.api.file.openSave(name + ".scene.json", json);
                    if(!savedPath) return;
                    dispatch(updateScenePath({ path: savedPath }));
                }
                else{
                    await window.api.file.save(path, json);
                }
                dispatch(updateSceneModified({ value: false }));
            }
        }
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [modified, path]);

    return (
        <div className="flex flex-1 flex-col p-1 overflow-auto scrollbar-thin">
            <div className="flex items-center">
                <Square3Stack3DIcon className="text-white size-4 mr-1"/>
                <span className="text-sm text-white font-medium select-none">
                    {name + (modified ? "*" : "")}
                </span>
            </div>
            <SceneNodes nodes={nodes}/>
        </div>
    );
}
function SceneNodes(props: { nodes: SceneFormat.SceneNode[]}){
    const { nodes } = props;

    return (
        <ul className="flex flex-col ml-2.5">
            {
                nodes.map(node => <SceneNode key={node.id} node={node}/>)
            }
        </ul>
    );
}
function SceneNode(props: { node: SceneFormat.SceneNode }){
    const { name, childs } = props.node;
    const [collapsed, setCollapsed] = useState(true);

    return (
        <li className="flex flex-col">
            <div className="flex">
                <div className="flex items-center">
                    {
                        childs.length > 0 ?
                        <button className="cursor-pointer w-4 h-4" onClick={() => setCollapsed(!collapsed)}>
                            {
                                collapsed ?
                                <ChevronRightIcon className="text-white size-4 transition hover:opacity-80"/>
                                :
                                <ChevronDownIcon className="text-white size-4 transition hover:opacity-80"/>
                            }
                        </button>
                        :
                        <div className="w-4 h-4"></div>
                    }
                </div>
                <div className="flex items-center cursor-pointer transition hover:opacity-80">
                    <CubeIcon className="text-white size-4 mr-1"/>
                    <span className="text-sm text-white select-none">{name}</span>
                </div>
            </div>
            {
                !collapsed &&
                <SceneNodes nodes={childs}/>
            }
        </li>
    );
}
