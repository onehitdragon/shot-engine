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

    // const interleaveArray = meshAsset.primitives[0].attribute.interleaveArray;
    // const vertexCount = interleaveArray.length / (3 + 3 + 2);
    // let j0 = 0, j1 = 3;
    // for(let i = 0; i < vertexCount; i++){
    //     console.log("v", i);
    //     console.log("position:", interleaveArray[j0], interleaveArray[j0 + 1], interleaveArray[j0 + 2]);
    //     j0 += 8;
    //     console.log("normal:", interleaveArray[j1], interleaveArray[j1 + 1], interleaveArray[j1 + 2]);
    //     j1 += 8;
    // }

    return (
        <div className="flex flex-col">
            <span className="text-white text-sm">Mesh</span>
            {
                primitives.map((prim, index) => {
                    const { interleaveArray } = prim.attribute;
                    const indices = prim.indices;
                    return <div key={index} className="flex flex-col ml-2">
                        <span className="text-white text-sm">Primitive index: {index}</span>
                        <span className="text-white text-sm">- vertices: {interleaveArray.length / (3 + 3 + 2)}</span>
                        <span className="text-white text-sm">- indices: {indices.length}</span>
                    </div>
                })
            }
        </div>
    );
}
