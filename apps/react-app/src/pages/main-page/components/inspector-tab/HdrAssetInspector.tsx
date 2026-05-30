import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../../global-state/hooks";
import { type HdrAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { bakeHdrFileThunk, inspectAssetThunk } from "../../../../global-state/thunks/inspector-thunks";
import { ButtonRow, TextRow } from "./components";

export function HdrAssetInspector(props: { inspector: HdrAssetInspector }){
    const { assetInfo, hdrAsset } = props.inspector;
    const dispatch = useAppDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gl, setGL] = useState<WebGL2RenderingContext | null>();

    useEffect(() => {
        const gl = canvasRef.current?.getContext("webgl2");
        setGL(gl);
    }, []);

    return (
        <div className="flex flex-col gap-1 flex-1 p-1 overflow-auto scrollbar-thin">
            <TextRow label="Id" content={assetInfo.uuid}/>
            <TextRow label="Status" content={hdrAsset ? "Baked" : "Not Baked"}/>
            <ButtonRow buttons={[
                {
                    label: "Bake",
                    onClick: () => {
                        if(!gl) return;
                        dispatch(bakeHdrFileThunk({
                            assetInfo, gl,
                            complete: () => {
                                dispatch(inspectAssetThunk({ assetInfo }));
                            }
                        }));
                    }
                }
            ]}/>
            <canvas ref={canvasRef}>
                Dont supports "canvas"
            </canvas>
        </div>
    );
}