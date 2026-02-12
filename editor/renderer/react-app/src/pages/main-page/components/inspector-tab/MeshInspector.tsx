import type { MeshInspector } from "../../../../global-state/slices/inspector-slice";

export function MeshInspector(props: { inspector: MeshInspector }){
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            <Mesh inspector={props.inspector}/>
        </div>
    );
}
function Mesh(props: { inspector: MeshInspector }){
    const { vertices, normals, vertexIndices } = props.inspector.mesh;
    return (
        <div className="flex flex-col">
            <span className="text-white text-sm">Mesh</span>
            <div className="flex flex-col ml-2">
                <span className="text-white text-sm">- vertices: {vertices.length / 3}</span>
                <span className="text-white text-sm">- normals: {normals.length / 3}</span>
                <span className="text-white text-sm">- indices: {vertexIndices.length}</span>
            </div>
        </div>
    );
}
