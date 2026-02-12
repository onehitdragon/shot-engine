import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import type { PrefabInspector } from "../../../../global-state/slices/inspector-slice";
import { addSceneNodeThunk } from "../../../../global-state/thunks/scene-manager-thunks";
import { renewPrefab } from "../../helpers/scene-manager-helper/SceneNodeHelper";
import { ButtonRow, TextRow } from "./components";

export function PrefabInspector(props: { inspector: PrefabInspector }){
    const { prefab } = props.inspector;
    const { nodeId, nodes } = prefab;
    const scene = useAppSelector(state => state.sceneManager.scene);
    const dispatch = useAppDispatch();
    return (
        <div className="gap-1 p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            <div className="flex justify-center">
                <span className="text-white text-sm">Prefab</span>
            </div>
            {
                scene &&
                <ButtonRow buttons={[{ label: "Add to Scene", onClick: () => {
                    const newPrefab = renewPrefab(prefab);
                    dispatch(addSceneNodeThunk({
                        nodeId: newPrefab.nodeId,
                        parentId: null,
                        nodes: newPrefab.nodes
                    }));
                } }]}/>
            }
            <TextRow label="Top id" content={nodeId}/>
            <div className="flex flex-col gap-5">
                {
                    nodes.map(node => <Node key={node.id} node={node}/>)
                }
            </div>
        </div>
    );
}
function Node(props: { node: SceneFormat.SceneNode }){
    const { id, name, components, childs } = props.node;
    return (
        <div className="flex flex-col">
            <div className="flex flex-col">
                <span className="select-none text-white font-bold text-sm rounded-lg">
                    {name}
                </span>
                <span className="select-none text-white text-sm rounded-lg">
                    node id: {id}
                </span>
            </div>
            {
                components.map((component) => {
                    if(component.type === "Transform"){
                        return <div key={component.id} className="flex flex-col">
                            <span className="text-white text-sm">
                                - pos: { component.position.toString() }
                            </span>
                            <span className="text-white text-sm">
                                - rot: { component.rotation.toString() }
                            </span>
                            <span className="text-white text-sm">
                                - scale: { component.scale.toString() }
                            </span>
                        </div>
                    }
                    else{
                        return <div key={component.id} className="flex flex-col">
                            <span className="text-white text-sm">{component.type}</span>
                        </div>
                    }
                })
            }
            <span className="text-white text-sm">[{childs.join(", ")}]</span>
        </div>
    );
}

