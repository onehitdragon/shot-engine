import { useAppDispatch } from "../../../../global-state/hooks";
import type { NodeContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { createConeNode, createCubeNode, createCylinderNode, createEmptyNode, createPbrTest, createSphereNode } from "../../helpers/scene-manager-helper/SceneNodeHelper";
import { createDirectionalLightComponent, createPbrShadingComponent, createPhongShadingComponent, createPointLightComponent, createSimpleShadingComponent, createSkyBoxComponent } from "../../helpers/scene-manager-helper/SceneNodeComponentHelper";
import { goAddedThunk, goRemovedThunk } from "../../../../global-state/thunks/go-tree-thunks";
import { componentAddedThunk } from "../../../../global-state/thunks/inspector-components-thunks";

export function SceneNodeContextMenu(
    props: { contextMenu: NodeContextMenu, x: number, y: number }
){
    const { contextMenu, x, y } = props;
    const { node } = contextMenu;
    const dispatch = useAppDispatch();
    const createEmptyChild = () => {
        const newNode = createEmptyNode();
        newNode.parent = node.id;
        dispatch(goAddedThunk({
            node: newNode
        }));
    }
    const createCubeChild = () => {
        const newNode = createCubeNode();
        newNode.parent = node.id;
        dispatch(goAddedThunk({
            node: newNode
        }));
    }
    const createSphereChild = () => {
        const newNode = createSphereNode();
        newNode.parent = node.id;
        dispatch(goAddedThunk({
            node: newNode
        }));
    }
    const createCylinderChild = () => {
        const newNode = createCylinderNode();
        newNode.parent = node.id;
        dispatch(goAddedThunk({
            node: newNode
        }));
    }
    const createConeChild = () => {
        const newNode = createConeNode();
        newNode.parent = node.id;
        dispatch(goAddedThunk({
            node: newNode
        }));
    }
    const addSimpleShadingComponent = () => {
        dispatch(componentAddedThunk({
            component: createSimpleShadingComponent(),
            unique: true,
        }));
    }
    const addPhongShadingComponent = () => {
        dispatch(componentAddedThunk({
            component: createPhongShadingComponent(),
            unique: true,
        }));
    }
    const addPbrShadingComponent = () => {
        dispatch(componentAddedThunk({
            component: createPbrShadingComponent(),
            unique: true,
        }));
    }
    const addPointLightComponent = () => {
        dispatch(componentAddedThunk({
            component: createPointLightComponent(),
            unique: true,
        }));
    }
    const addDirectionalLightComponent = () => {
        dispatch(componentAddedThunk({
            component: createDirectionalLightComponent(),
            unique: true,
        }));
    }
    const addSkyBox = () => {
        dispatch(componentAddedThunk({
            component: createSkyBoxComponent(),
            unique: true,
        }));
    }
    const createPbrTestChild = () => {
        const newNodes = createPbrTest();
        for(const newNode of newNodes){
            newNode.parent = node.id;
            dispatch(goAddedThunk({
                node: newNode
            }));
        }
    }
    const remmove = () => {
        dispatch(goRemovedThunk({ node }));
    }

    return (
        <div style={{ left: x, top: y }} className="absolute left-1/2 top-1/2">
            <ul className='flex flex-col p-1 rounded-sm bg-linear-to-b bg-gray-700
                border border-slate-500'>
                <span className="select-none text-white text-sm my-1 text-center font-bold">
                    {node.name}
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
                    onMouseDown={createSphereChild}
                >
                    Create Sphere Child
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={createCylinderChild}
                >
                    Create Cylinder Child
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={createConeChild}
                >
                    Create Cone Child
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
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={addPbrShadingComponent}
                >
                    Add PBR Shading
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={addSkyBox}
                >
                    Add Sky Box
                </li>
                <li className='text-xs text-white select-none cursor-pointer transition
                    hover:bg-blue-500 px-2 py-1 rounded-sm'
                    onMouseDown={createPbrTestChild}
                >
                    createPbrTestChild
                </li>
            </ul>
        </div>
    );
}