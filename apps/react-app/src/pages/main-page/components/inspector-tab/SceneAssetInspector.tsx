import { useAppDispatch } from "../../../../global-state/hooks";
import type { SceneAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { sceneAssetOpenedThunk } from "../../../../global-state/thunks/scene-asset-thunk";
import { TextRow } from "./components";

export function SceneAssetInspector(props: { inspector: SceneAssetInspector }){
    const { assetInfo, sceneAsset } = props.inspector;
    const dispatch = useAppDispatch();
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            <TextRow label="Id" content={assetInfo.uuid}/>
            <TextRow label="Name" content={assetInfo.name}/>
            <button className="text-white text-sm px-3 py-1 rounded-2xl bg-gray-600 cursor-pointer
                transition hover:opacity-80"
                onClick={() => {
                    dispatch(sceneAssetOpenedThunk({
                        assetInfo,
                        sceneAsset
                    }));
                }}
            >
                Open scene
            </button>
        </div>
    );
}
