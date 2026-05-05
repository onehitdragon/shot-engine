import { CubeIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronRightIcon, Square3Stack3DIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { renameGameObject, selectNodeById } from "../../../../global-state/slices/go-tree-slice";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { createEmptyNode } from "../../helpers/scene-manager-helper/SceneNodeHelper";
import type { NodeState } from "../../../../global-state/slices/go-tree-slice";
import { goAddedThunk, goTreeClosedThunk, goTreeSavedThunk, nodeFocusedThunk, nodeUnfocusedThunk } from "../../../../global-state/thunks/go-tree-thunks";

export function GameObjectTree(){
    const rootIds = useAppSelector(state => state.goTree.rootIds);
    const allowModify = useAppSelector(state => state.goTree.allowModify);
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
        <div className={`flex flex-1 flex-col h-full p-1 overflow-auto scrollbar-thin
            ${allowModify ? "opacity-100" : "opacity-70"}`}>
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
            {
                rootIds.map(rootId => <GameObjectItem key={rootId} id={rootId}/>)
            }
        </div>
    );
}
function GameObjectItem(props: { id: string }){
    const gameObject = useAppSelector(state => selectNodeById(state, props.id));
    const isPrefab = "prefabRef" in gameObject;
    const [collapsed, setCollapsed] = useState(true);
    const focusedId = useAppSelector(state => state.goTree.focusedId);

    return (
        isPrefab ? 
         <div className="flex flex-col">
            <div className="flex">
                {
                    (!focusedId || focusedId != gameObject.id) ?
                    <NonSelected gameObject={gameObject}/> :
                    <Selected gameObject={gameObject}/>
                }
            </div>
        </div>
        :
        <div className="flex flex-col">
            <div className="flex">
                <div className="flex items-center">
                    {
                        gameObject.childs.length > 0 ?
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
                    (!focusedId || focusedId != gameObject.id) ?
                    <NonSelected gameObject={gameObject}/> :
                    <Selected gameObject={gameObject}/>
                }
            </div>
            {
                !collapsed &&
                <div className="flex flex-col ml-2.5">
                    {
                        gameObject.childs.map((child) => {
                            return <GameObjectItem key={child} id={child}/>
                        })
                    }
                </div>
            }
        </div>
    );
}
function NonSelected(props: { gameObject: NodeState }){
    const { gameObject } = props;
    const isPrefab = "prefabRef" in gameObject;
    const dispatch = useAppDispatch();
    const click = () => {
        dispatch(nodeFocusedThunk({ node: gameObject }));
    }
    const rightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(nodeFocusedThunk({ node: gameObject }));
        dispatch(openContextMenu({
            contextMenu: { type: "node", node: gameObject },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }

    return (
        <div className="flex flex-1 items-center cursor-pointer transition hover:opacity-80"
            onClick={click} onContextMenu={rightClick}>
            <CubeIcon className="text-white size-4 mx-1"/>
            <span className={`text-sm ${!isPrefab ? "text-white" : "text-cyan-500"} select-none`}>
                {!isPrefab ? gameObject.name : "Prefab"}
            </span>
        </div>
    );
}
function Selected(props: { gameObject: NodeState }){
    const { gameObject } = props;
    const isPrefab = "prefabRef" in gameObject;
    const dispatch = useAppDispatch();
    const allowModify = useAppSelector(state => state.goTree.allowModify);
    const [editing, setEditing] = useState(false);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if(editing) return;
            const target = e.target as HTMLElement | null;
            if(!target) return;
            if(target.closest("#scene-node-selected")) return;
            if(target.closest("#inspector")) return;
            if(target.closest("#context-menu")) return;
            dispatch(nodeUnfocusedThunk());
        }
        window.addEventListener("mousedown", handler);
        return () => {
            window.removeEventListener("mousedown", handler);
        }
    }, [editing]);
    const rightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(openContextMenu({
            contextMenu: { type: "node", node: gameObject },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }
    const doubleClick = () => {
        if(!allowModify) return;
        setEditing(true);
    }

    return (
        <div id="scene-node-selected" className="flex flex-1 items-center cursor-pointer bg-gray-600"
            onContextMenu={rightClick}
            onDoubleClick={doubleClick}
        >
            <CubeIcon className="text-white size-4 mx-1"/>
            {
                !editing || isPrefab?
                <span className={`text-sm ${!isPrefab ? "text-white" : "text-cyan-500"} select-none`}>{
                    !isPrefab ? gameObject.name : "Prefab"
                }</span> :
                <Editing gameObject={gameObject} onBlur={() => {
                    setEditing(false);
                    dispatch(nodeUnfocusedThunk());
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
        <input className="outline-none border text-sm px-0.5 w-full text-white" autoFocus spellCheck={false}
            value={nameState}
            onBlur={onBlur}
            onChange={(e) => {
                setNameState(e.target.value);
            }}
        />
    );
}
