import { useAppDispatch } from "../../../../global-state/hooks";
import type { SceneNodeContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { addUniqueComponentToSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { createCubeSceneNode, createEmptySceneNode } from "../../helpers/scene-manager-helper/SceneNodeHelper";
import { createDirectionalLightComponent, createPhongShadingComponent, createPointLightComponent, createSimpleShadingComponent } from "../../helpers/scene-manager-helper/SceneNodeComponentHelper";
import { addSceneNodeThunk, removeSceneNodeThunk } from "../../../../global-state/thunks/scene-manager-thunks";

export function SceneNodeContextMenu(
    props: { contextMenu: SceneNodeContextMenu, x: number, y: number }
){
    const { contextMenu, x, y } = props;
    const { sceneNode } = contextMenu;
    const dispatch = useAppDispatch();
    const createEmptyChild = () => {
        const node = createEmptySceneNode(sceneNode.id);
        dispatch(addSceneNodeThunk({
            nodeId: node.id,
            parentId: sceneNode.id,
            nodes: [node]
        }));
    }
    const remmove = () => {
        dispatch(removeSceneNodeThunk({ id: sceneNode.id }));
    }
    const createCubeChild = () => {
        const node = createCubeSceneNode(sceneNode.id);
        dispatch(addSceneNodeThunk({
            nodeId: node.id,
            parentId: sceneNode.id,
            nodes: [node]
        }));
    }
    const addPointLightComponent = () => {
        dispatch(addUniqueComponentToSceneNode({
            nodeId: sceneNode.id,
            component: createPointLightComponent()
        }));
    }
    const addDirectionalLightComponent = () => {
        dispatch(addUniqueComponentToSceneNode({
            nodeId: sceneNode.id,
            component: createDirectionalLightComponent()
        }));
    }
    const addSimpleShadingComponent = () => {
        dispatch(addUniqueComponentToSceneNode({
            nodeId: sceneNode.id,
            component: createSimpleShadingComponent()
        }));
    }
    const addPhongShadingComponent = () => {
        dispatch(addUniqueComponentToSceneNode({
            nodeId: sceneNode.id,
            component: createPhongShadingComponent()
        }));
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
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={addPointLightComponent}
                >
                    Add Point Light Component
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={addDirectionalLightComponent}
                >
                    Add Direction Light Component
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={addSimpleShadingComponent}
                >
                    Add Simple Shading
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={addPhongShadingComponent}
                >
                    Add Phong Shading
                </li>
            </ul>
        </div>
    );
}