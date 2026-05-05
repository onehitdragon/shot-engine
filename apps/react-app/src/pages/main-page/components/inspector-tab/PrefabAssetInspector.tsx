import { useAppDispatch } from "../../../../global-state/hooks";
import type { PrefabAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { prefabAssetOpenedThunk } from "../../../../global-state/thunks/prefab-asset-thunk";
import { TextRow } from "./components";

export function PrefabAssetInspector(props: { inspector: PrefabAssetInspector }){
    const { assetInfo, prefabAsset } = props.inspector;
    const dispatch = useAppDispatch();
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col">
            <TextRow label="Id" content={assetInfo.uuid}/>
            <TextRow label="Name" content={assetInfo.name}/>
            <button className="text-white text-sm px-3 py-1 rounded-2xl bg-gray-600 cursor-pointer
                transition hover:opacity-80"
                onClick={() => {
                    dispatch(prefabAssetOpenedThunk({
                        assetInfo,
                        prefabAsset
                    }));
                }}
            >
                Open prefab
            </button>
        </div>
    );
}
