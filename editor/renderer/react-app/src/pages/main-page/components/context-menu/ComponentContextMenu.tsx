import { useAppDispatch } from "../../../../global-state/hooks";
import type { ComponentContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { removeComponentOfSceneNode } from "../../../../global-state/slices/scene-manager-slice";

export function ComponentContextMenu(props: { contextMenu: ComponentContextMenu, x: number, y: number }){
    const { contextMenu, x, y } = props;
    const { sceneNode, component } = contextMenu;

    return (
        <div id="component-context-menu" style={{ left: x, top: y }} className="absolute left-1/2 top-1/2">
            <ul className='flex flex-col p-1 rounded-sm bg-gradient-to-b bg-gray-700
                border border-slate-500'>
                {
                    (component.type === "Shading" || component.type === "Light") &&
                    <RemoveComponent node={sceneNode} component={component}/>
                }
            </ul>
        </div>
    );
}
function RemoveComponent(props: { node: SceneFormat.SceneNode, component: Components.Component }){
    const { node, component } = props;
    const { id } = component;
    const dispatch = useAppDispatch();
    const onMouseDown = () => {
        dispatch(removeComponentOfSceneNode({ nodeId: node.id, componentId: id }));
    }

    return (
        <li className='text-xs text-white select-none cursor-pointer transition
            hover:bg-blue-500 px-2 py-1 rounded-sm'
            onMouseDown={onMouseDown}
        >
            Remove component
        </li>
    );
}
