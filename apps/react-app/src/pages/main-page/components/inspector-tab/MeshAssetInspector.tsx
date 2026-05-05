import type { MeshAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { TextRow } from "./components";

export function MeshAssetInspector(props: { inspector: MeshAssetInspector }){
    const { assetInfo } = props.inspector;
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            <TextRow label="Id" content={assetInfo.uuid}/>
            <Mesh inspector={props.inspector}/>
        </div>
    );
}
function Mesh(props: { inspector: MeshAssetInspector }){
    const { meshAsset } = props.inspector;
    const { primitives } = meshAsset;
    return (
        <div className="flex flex-col">
            <span className="text-white text-sm">Mesh</span>
            {
                primitives.map((prim, index) => {
                    const { positions, normals, uvs } = prim.attribute;
                    const indices = prim.indices;
                    return <div key={index} className="flex flex-col ml-2">
                        <span className="text-white text-sm">Primitive index: {index}</span>
                        <span className="text-white text-sm">- vertices: {positions.length / 3}</span>
                        <span className="text-white text-sm">- normals: {normals.length / 3}</span>
                        <span className="text-white text-sm">- uvs: {uvs.length / 2}</span>
                        <span className="text-white text-sm">- indices: {indices.length}</span>
                    </div>
                })
            }
        </div>
    );
}
