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
                    const { interleaveArray } = prim.attribute;
                    const indices = prim.indices;
                    return <div key={index} className="flex flex-col ml-2">
                        <span className="text-white text-sm">Primitive index: {index}</span>
                        <span className="text-white text-sm">- type: {prim.type}</span>
                        <span className="text-white text-sm">
                            - vertices: {interleaveArray.length / (prim.type === "static" ? 44 : 64)}
                        </span>
                        <span className="text-white text-sm">- indices: {indices.length}</span>
                        <span className="text-white text-sm">- aabb: {JSON.stringify(prim.aabb)}</span>
                    </div>
                })
            }
        </div>
    );
}
