import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { closeContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { SceneNodeContextMenu } from "./SceneNodeContextMenu";
import { ComponentContextMenu } from "./ComponentContextMenu";

export function ContextMenu(){
    const context = useAppSelector(state => state.contextMenu.contextMenu);
    const { x, y } = useAppSelector(state => state.contextMenu.mousePos);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if(!context) return;
        const handler = () => {
            dispatch(closeContextMenu());
        }
        window.addEventListener("mousedown", handler);
        return () => {
            window.removeEventListener("mousedown", handler);
        };
    }, [context]);

    return (
        !context ? <div></div> :
        context.type == "scene-node" ? <SceneNodeContextMenu contextMenu={context} x={x} y ={y}/> :
        context.type == "component" ? <ComponentContextMenu contextMenu={context} x={x} y ={y}/> :
        <div></div>
    );
}
