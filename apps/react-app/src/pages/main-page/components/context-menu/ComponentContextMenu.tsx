import type { Component } from "@shot-engine/types";
import { useAppDispatch } from "../../../../global-state/hooks";
import type { ComponentContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { componentRemovedThunk } from "../../../../global-state/thunks/inspector-components-thunks";
export function ComponentContextMenu(props: { contextMenu: ComponentContextMenu, x: number, y: number }){
    const { contextMenu, x, y } = props;

    return (
        <div style={{ left: x, top: y }} className="absolute left-1/2 top-1/2">
            <ul className='flex flex-col p-1 rounded-sm bg-linear-to-b bg-gray-700
                border border-slate-500'>
                <RemoveComponent component={contextMenu.component}/>
            </ul>
        </div>
    );
}
function RemoveComponent(props: { component: Component }){
    const { component } = props;
    const dispatch = useAppDispatch();
    const onMouseDown = () => {
        dispatch(componentRemovedThunk({ component }));
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
