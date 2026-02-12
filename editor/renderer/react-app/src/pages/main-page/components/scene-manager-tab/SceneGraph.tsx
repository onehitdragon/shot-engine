import { CubeIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronRightIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { focusSceneNode, renameSceneNode, selectSceneNodeById, unfocusSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { addSceneNodeThunk, saveSceneThunk } from "../../../../global-state/thunks/scene-manager-thunks";
import { createEmptySceneNode } from "../../helpers/scene-manager-helper/SceneNodeHelper";

export function Scene(props: { scene: SceneFormat.Scene }){
    const { scene } = props;
    const { name, nodes } = scene;
    const modified = useAppSelector(state => state.sceneManager.modified);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handler = async (e: KeyboardEvent) => {
            if(e.ctrlKey && e.key == "s") dispatch(saveSceneThunk());
        }
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);
    const createEmptyChild = () => {
        const node = createEmptySceneNode(null);
        dispatch(addSceneNodeThunk({
            nodeId: node.id,
            parentId: null,
            nodes: [node]
        }));
    }

    return (
        <div className="flex flex-1 flex-col h-full p-1 overflow-auto scrollbar-thin">
            <div className="flex items-center">
                <Square3Stack3DIcon className="text-white size-4 mr-1"/>
                <span className="text-sm text-white font-medium select-none">
                    {name + (modified ? "*" : "")}
                </span>
                <div className="flex items-center justify-end flex-1">
                    <button className="flex items-center cursor-pointer transition hover:opacity-80"
                        onClick={createEmptyChild}
                    >
                        <CubeIcon className="size-4 text-white"/>
                        <span className="text-xs text-white">+</span>
                    </button>
                </div>
            </div>
            <SceneNodes nodes={nodes}/>
        </div>
    );
}
function SceneNodes(props: { nodes: string[], parent?: string }){
    const { nodes, parent } = props;
    return (
        <ul className="flex flex-col ml-2.5">
            {
                nodes.map(node => <SceneNode key={node} nodeId={node} parent={parent}/>)
            }
        </ul>
    );
}
function SceneNode(props: { nodeId: string, parent?: string }){
    const { nodeId, parent } = props;
    const node = useAppSelector(state => selectSceneNodeById(state, nodeId));
    const { id, childs } = node;
    const [collapsed, setCollapsed] = useState(true);
    const focusedId = useAppSelector(state => state.sceneManager.focusedId);

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
                {
                    (!focusedId || focusedId != id) ?
                    <NonSelected node={node} parent={parent}/> :
                    <Selected node={node} parent={parent}/>
                }
            </div>
            {
                !collapsed &&
                <SceneNodes nodes={childs} parent={id}/>
            }
        </li>
    );
}
function NonSelected(props: { node: SceneFormat.SceneNode, parent?: string }){
    const { node, parent } = props;
    const dispatch = useAppDispatch();
    const click = () => {
        dispatch(focusSceneNode({ id: node.id }));
    }
    const rightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(focusSceneNode({ id: node.id }));
        dispatch(openContextMenu({
            contextMenu: { type: "scene-node", sceneNode: node, parent },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }

    return (
        <div className="flex flex-1 items-center cursor-pointer transition hover:opacity-80"
            onClick={click} onContextMenu={rightClick}>
            <CubeIcon className="text-white size-4 mx-1"/>
            <span className="text-sm text-white select-none">{node.name}</span>
        </div>
    );
}
function Selected(props: { node: SceneFormat.SceneNode, parent?: string }){
    const { node, parent } = props;
    const { name } = node;
    const dispatch = useAppDispatch();
    const [editing, setEditing] = useState(false);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if(editing) return;
            const target = e.target as HTMLElement | null;
            if(!target) return;
            if(target.closest("#scene-node-selected")) return;
            if(target.closest("#inspector")) return;
            if(target.closest("#component-context-menu")) return;
            dispatch(unfocusSceneNode());
        }
        window.addEventListener("mousedown", handler);
        return () => {
            window.removeEventListener("mousedown", handler);
        }
    }, [editing]);
    const rightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(openContextMenu({
            contextMenu: { type: "scene-node", sceneNode: node, parent },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }
    const doubleClick = () => {
        setEditing(true);
    }

    return (
        <div id="scene-node-selected" className="flex flex-1 items-center cursor-pointer bg-gray-600"
            onContextMenu={rightClick}
            onDoubleClick={doubleClick}
        >
            <CubeIcon className="text-white size-4 mx-1"/>
            {
                !editing ?
                <span className="text-sm text-white select-none">{name}</span> :
                <Editing node={node} onBlur={() => {
                    setEditing(false);
                    dispatch(unfocusSceneNode());
                }}/>
            }
        </div>
    );
}
function Editing(props: { node: SceneFormat.SceneNode, onBlur: () => void }){
    const { node } = props;
    const { name } = node;
    const [nameState, setNameState] = useState(name);
    const dispatch = useAppDispatch();
    const onBlur = () => {
        props.onBlur();
        dispatch(renameSceneNode({ nodeId: node.id, newName: nameState }));
    }

    return (
        <input className="outline-none border text-sm px-0.5 w-full text-white" autoFocus spellCheck={false}
            value={nameState}
            onBlur={onBlur}
            onChange={(e) => {
                setNameState(e.target.value);
            }}
        />
    );
}
