import { useAppDispatch } from "../../../../global-state/hooks";
import type { SceneNodeContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { addSceneNodeChild, removeSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { createCubeSceneNode, createEmptySceneNode } from "../../helpers/SceneNodeHelper";

export function SceneNodeContextMenu(
    props: { contextMenu: SceneNodeContextMenu, x: number, y: number }
){
    const { contextMenu, x, y } = props;
    const { sceneNode } = contextMenu;
    const dispatch = useAppDispatch();
    const createEmptyChild = () => {
        dispatch(addSceneNodeChild({ parentId: sceneNode.id, child: createEmptySceneNode() }));
    }
    const remmove = () => {
        dispatch(removeSceneNode({ id: sceneNode.id }));
    }
    const createCubeChild = () => {
        dispatch(addSceneNodeChild({ parentId: sceneNode.id, child: createCubeSceneNode(dispatch) }));
    }

    return (
        <div style={{ left: x, top: y }} className="absolute left-1/2 top-1/2">
            <ul className='flex flex-col p-1 rounded-sm bg-gradient-to-b bg-gray-700
                border border-slate-500'>
                <span className="select-none text-white text-sm my-1 text-center font-bold">
                    {sceneNode.name}
                </span>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={createEmptyChild}
                >
                    Create Empty Child
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={createCubeChild}
                >
                    Create Cube Child
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={remmove}
                >
                    Remove
                </li>
            </ul>
        </div>
    );
}