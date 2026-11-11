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
function numberToGLString(num: number){
    if(num === 0){
        return `(${num})(GL.POINTS)`;
    }
    else if(num === 1){
        return `(${num})(GL.LINES)`;
    }
    else if(num === 2){
        return `(${num})(GL.LINE_LOOP)`;
    }
    else if(num === 3){
        return `(${num})(GL.LINE_STRIP)`;
    }
    else if(num === 4){
        return `(${num})(GL.TRIANGLES)`;
    }
    else if(num === 5){
        return `(${num})(GL.TRIANGLE_STRIP)`;
    }
    else if(num === 6){
        return `(${num})(GL.TRIANGLE_FAN)`;
    }

    if(num === 5120){
        return `(${num})(GL.BYTE)(8 bits)`;
    }
    else if(num === 5121){
        return `(${num})(GL.UNSIGNED_BYTE)(8 bits)`;
    }
    else if(num === 5122){
        return `(${num})(GL.SHORT)(16 bits)`;
    }
    else if(num === 5123){
        return `(${num})(GL.UNSIGNED_SHORT)(16 bits)`;
    }
    else if(num === 5124){
        return `(${num})(GL.INT)(32 bits)`;
    }
    else if(num === 5125){
        return `(${num})(GL.UNSIGNED_INT)(32 bits)`;
    }
    else if(num === 5126){
        return `(${num})(GL.FLOAT)(32 bits)`;
    }

    return `(${num})(Error)`;
}
function Mesh(props: { inspector: MeshAssetInspector }){
    const { meshAsset } = props.inspector;
    const { primitives, invBindPoseMatrices } = meshAsset;

    return (
        <div className="flex flex-col">
            <span className="text-white text-sm font-bold">Mesh</span>
            {
                primitives.map((prim, index) => {
                    const { interleaveArray, position, normal, uv, tangent, weight, joint } = prim.attribute;
                    const { indices, indexType, drawMode, aabb } = prim;
                    return <div key={index} className="flex flex-col ml-2">
                        <span className="text-white text-sm">Primitive index: {index}</span>
                        <div key={index} className="flex flex-col ml-2">
                            <span className="text-white text-sm">Attribute</span>
                            <span className="text-white text-sm">
                                - position: {numberToGLString(position.type)} ({position.normalized ? "normalized" : "not normalized"})
                            </span>
                            <span className="text-white text-sm">
                                - normal: {numberToGLString(normal.type)} ({normal.normalized ? "normalized" : "not normalized"})
                            </span>
                            <span className="text-white text-sm">
                                - uv: {numberToGLString(uv.type)} ({uv.normalized ? "normalized" : "not normalized"})
                            </span>
                            <span className="text-white text-sm">
                                - tangent: {numberToGLString(tangent.type)} ({tangent.normalized ? "normalized" : "not normalized"})
                            </span>
                            <span className="text-white text-sm">
                                - weight: {numberToGLString(weight.type)} ({weight.normalized ? "normalized" : "not normalized"})
                            </span>
                            <span className="text-white text-sm">
                                - joint: {numberToGLString(joint.type)} ({joint.normalized ? "normalized" : "not normalized"})
                            </span>
                        </div>
                        <span className="text-white text-sm">- indices: {indices.length}</span>
                        <span className="text-white text-sm">- indexType: {numberToGLString(indexType)}</span>
                        <span className="text-white text-sm">- drawMode: {numberToGLString(drawMode)}</span>
                        <span className="text-white text-sm">- aabb: {JSON.stringify(aabb)}</span>
                    </div>
                })
            }
            <span className="text-white text-sm font-bold">Other</span>
            <div className="flex flex-col ml-2">
                <span className="text-white text-sm">- invBindPoseMatrices: {invBindPoseMatrices.length / 16}</span>
            </div>
        </div>
    );
}
