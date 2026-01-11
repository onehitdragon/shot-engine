import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import type { AssimpInspector } from "../../../../global-state/slices/inspector-slice";
import { mat4 } from "gl-matrix";
import { Euler, degrees } from "@math.gl/core";
import { useAppDispatch } from "../../../../global-state/hooks";
import { addTopSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { createAssimpSceneNode } from "../../helpers/SceneNodeHelper";

export function AssimpInspector(props: { inspector: AssimpInspector }){
    const { assimp } = props.inspector;
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            <div className="flex flex-col">
                <span className="text-white text-center text-sm">Nodes</span>
                <Node node={assimp.rootnode} meshes={assimp.meshes}/>
            </div>
            <div className="flex flex-col">
                <span className="text-white text-center text-sm">Meshes</span>
                <ul className="flex flex-col">
                    {
                        assimp.meshes.map((mesh, index) => {
                            return <Mesh key={index} mesh={mesh}/>
                        })
                    }
                </ul>
            </div>
        </div>
    );
}
function AddToSceneButton(props: { node: AssimpFormat.Node, meshes: AssimpFormat.Mesh[] }){
    const { node, meshes } = props;
    const dispatch = useAppDispatch();
    const click = () => {
        dispatch(addTopSceneNode({
            node: createAssimpSceneNode(node, meshes, dispatch)
        }));
    }

    return (
        <button className="hover:cursor-pointer transition text-white hover:opacity-50"
            onClick={click}>
            <ArrowsRightLeftIcon className="size-4"/>
        </button>
    );
}
function Node(props: { node: AssimpFormat.Node, meshes: AssimpFormat.Mesh[] }){
    const { name, transformation, children, meshes: meshesIndies } = props.node;
    const meshes = props.meshes;
    const transformMat4 = mat4.clone(transformation);
    mat4.transpose(transformMat4, transformMat4);
    const translate = mat4.getTranslation([], transformMat4);
    const rotateQuat = mat4.getRotation([], transformMat4);
    const rotate = degrees(new Euler().fromQuaternion([...rotateQuat]));
    const scale = mat4.getScaling([], transformMat4);

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-0.5">
                <span className="select-none text-white bg-gray-600 text-sm px-2 py-1 rounded-lg">
                    {name}
                </span>
                <div className="flex items-center">
                    <AddToSceneButton node={props.node} meshes={meshes}/>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-white text-sm">
                    - pos: ({translate[0]}, {translate[1]}, {translate[2]})
                </span>
                <span className="text-white text-sm">
                    - rot: ({rotate[0]}, {rotate[1]}, {rotate[2]})
                </span>
                <span className="text-white text-sm">
                    - scale: ({scale[0]}, {scale[1]}, {scale[2]})
                </span>
                <span className="text-white text-sm">- meshes: ({
                    meshesIndies.map(meshIndex => meshes[meshIndex].name).join(", ")
                })</span>
            </div>
            <ul className="ml-3 flex flex-col">
                {
                    children.map((child, index) => {
                        return <Node key={index} node={child} meshes={meshes}/>
                    })
                }
            </ul>
        </div>
    );
}
function Mesh(props: { mesh: AssimpFormat.Mesh }){
    const { name, vertices, normals, faces } = props.mesh;
    return (
        <div className="flex flex-col">
            <span className="text-white text-sm">{name}</span>
            <div className="flex flex-col ml-2">
                <span className="text-white text-sm">- vertices: {vertices.length / 3}</span>
                <span className="text-white text-sm">- normals: {normals.length / 3}</span>
                <span className="text-white text-sm">- faces: {faces.length}</span>
            </div>
        </div>
    );
}
