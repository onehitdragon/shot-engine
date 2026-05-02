import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import type { FBXInspector } from "../../../../global-state/slices/inspector-slice";

export function FBXInspector(props: { fbxInspector: FBXInspector }){
    const { fbx } = props.fbxInspector;
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            {
                fbx.parentObjectNodes.map(objectNode => {
                    return <ObjectNode key={objectNode.id} objectNode={objectNode}/>;
                })
            }
        </div>
    );
}
function ObjectNode(props: { objectNode: FBXFormat.ObjectNode }){
    const { name } = props.objectNode;

    return (
        <div className="flex justify-between items-center">
            <span className="select-none text-white bg-gray-600 text-sm px-2 py-1 rounded-lg">
                {name}
            </span>
            <div className="flex items-center">
                <button className="hover:cursor-pointer transition text-white hover:opacity-50">
                    <ArrowsRightLeftIcon className="size-4"/>
                </button>
            </div>
        </div>
    );
}
