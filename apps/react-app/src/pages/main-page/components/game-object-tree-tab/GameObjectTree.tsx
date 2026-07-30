import { CubeIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronRightIcon, Square3Stack3DIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { renameGameObject, toggleCollapse } from "../../../../global-state/slices/go-tree-slice";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { createEmptyNode } from "../../helpers/scene-manager-helper/SceneNodeHelper";
import type { NodeState } from "../../../../global-state/slices/go-tree-slice";
import { goAddedThunk, goTreeClosedThunk, goTreeSavedThunk, nodeFocusedThunk, NodesInfo } from "../../../../global-state/thunks/go-tree-thunks";
import { Virtuoso } from "react-virtuoso";
import { updateOrigin, updateR } from "../../../../global-state/slices/gizmo-orbit-camera-slice";

export function GameObjectTree(){
    const rootIds = useAppSelector(state => state.goTree.rootIds);
    const modified = useAppSelector(state => state.goTree.modified);
    const opened = useAppSelector(state => state.goTree.opened);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handler = async (e: KeyboardEvent) => {
            if(e.ctrlKey && e.key == "s" && modified) dispatch(goTreeSavedThunk());
        }
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [modified]);
    const createEmptyRoot = () => {
        dispatch(goAddedThunk({
            node: createEmptyNode()
        }));
    }
    const close = () => {
        dispatch(goTreeClosedThunk());
    }

    return (
        !opened ?
        <div></div>:
        <div className={`flex flex-1 flex-col h-full p-1 overflow-auto scrollbar-thin}`}>
            <div className="flex items-center">
                <Square3Stack3DIcon className="text-white size-4 mr-1"/>
                <span className="text-sm text-white font-medium select-none">
                    {`Root count: ${rootIds.length}` + (modified ? "*" : "")}
                </span>
                <div className="flex items-center justify-end flex-1 gap-1">
                    <button className="flex items-center cursor-pointer transition hover:opacity-80"
                        onClick={createEmptyRoot}
                    >
                        <CubeIcon className="size-4 text-white"/>
                        <span className="text-xs text-white">+</span>
                    </button>
                    <button className="flex items-center cursor-pointer transition hover:opacity-80"
                        onClick={close}
                    >
                        <NoSymbolIcon className="size-4 text-red-500"/>
                    </button>
                </div>
            </div>
            <GameObjectListMemo />
        </div>
    );
}
const GameObjectListMemo = React.memo(GameObjectList);
function GameObjectList(){
    const rootIds = useAppSelector(state => state.goTree.rootIds);
    const nodes = useAppSelector(state => state.goTree.nodes);
    const flatNodes = flat(rootIds);
    function flat(rootIds: string[]){
        const list: GameObjectItemProps[] = [];
        recur(rootIds);
        function recur(nodeIds: string[], depth = 0){
            for(const nodeId of nodeIds){
                const node = nodes.entities[nodeId];
                if(!node) continue;
                list.push({
                    node,
                    depth
                });
                if(node.collapsed) continue;
                recur(node.childs, depth + 1);
            }
        }
        return list;
    }
    return (
        <Virtuoso
            data={flatNodes}
            itemContent={(_, flatNode) => <GameObjectItem {...flatNode}/>}
        />
    );
}
type GameObjectItemProps = {
    node: NodeState,
    depth: number
}
function GameObjectItem(props: GameObjectItemProps){
    const { node, depth } = props;
    const dispatch = useAppDispatch();
    const focusedId = useAppSelector(state => state.goTree.focusedId);

    return (
        <div className="flex" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
            <div className="flex items-center">
                {
                    node.childs.length > 0 ?
                    <button className="cursor-pointer w-4 h-4"
                        onClick={() => { dispatch(toggleCollapse({ id: node.id })) }}>
                        {
                            node.collapsed ?
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
                (!focusedId || focusedId !== node.id) ?
                <NonSelectedMemo nodeState={node}/> :
                <Selected nodeState={node}/>
            }
        </div>
    );
}
const NonSelectedMemo = React.memo(NonSelected);
function NonSelected(props: { nodeState: NodeState }){
    const { nodeState } = props;
    const isPrefab = nodeState.isPrefab;
    const dispatch = useAppDispatch();
    const click = () => {
        dispatch(nodeFocusedThunk({ node: nodeState }));
    }
    const rightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(nodeFocusedThunk({ node: nodeState }));
        dispatch(openContextMenu({
            contextMenu: { type: "node", node: nodeState },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }

    return (
        <div id="go-non-selected"
            className="flex flex-1 items-center cursor-pointer transition hover:opacity-80"
            onClick={click} onContextMenu={rightClick}>
            <CubeIcon className="text-white size-4 mx-1"/>
            <span className={`text-sm ${!isPrefab ? "text-white" : "text-cyan-500"} select-none`}>
                {nodeState.name}
            </span>
        </div>
    );
}
function Selected(props: { nodeState: NodeState }){
    const { nodeState } = props;
    const dispatch = useAppDispatch();
    const allowModify = nodeState.isPrefab ? false : true;
    const [editing, setEditing] = useState(false);
    const rightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(openContextMenu({
            contextMenu: { type: "node", node: nodeState },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }
    const doubleClick = () => {
        if(!allowModify) return;
        setEditing(true);
    }
    const cameraFocus = () => {
        const nodeWorldPos = NodesInfo.getInstance().getWorldPos(nodeState.id);
        if(!nodeWorldPos) return;
        dispatch(updateOrigin({ origin: nodeWorldPos }));
        dispatch(updateR({ r: 5 }));
    }

    return (
        <div id="scene-node-selected" className="flex flex-1 items-center cursor-pointer bg-gray-600"
            onContextMenu={rightClick}
            onDoubleClick={() => {
                doubleClick();
                cameraFocus();
            }}
        >
            <CubeIcon className="text-white size-4 mx-1"/>
            {
                !editing || nodeState.isPrefab?
                <span className={`text-sm ${!nodeState.isPrefab ? "text-white" : "text-cyan-500"} select-none`}>
                    {nodeState.name}
                </span> :
                <Editing gameObject={nodeState} onBlur={() => {
                    setEditing(false);
                }}/>
            }
        </div>
    );
}
function Editing(props: { gameObject: Extract<NodeState, { childs: string[] }>, onBlur: () => void }){
    const { gameObject } = props;
    const [nameState, setNameState] = useState(gameObject.name);
    const dispatch = useAppDispatch();
    const onBlur = () => {
        props.onBlur();
        dispatch(renameGameObject({ id: gameObject.id, newName: nameState }));
    }

    return (
        <input id="node-name-editing-input" className="outline-none border text-sm px-0.5 w-full text-white" autoFocus spellCheck={false}
            value={nameState}
            onBlur={onBlur}
            onChange={(e) => {
                setNameState(e.target.value);
            }}
        />
    );
}
