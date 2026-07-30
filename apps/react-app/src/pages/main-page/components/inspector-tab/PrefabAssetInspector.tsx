import { useAppDispatch } from "../../../../global-state/hooks";
import type { PrefabAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { prefabDuplicatedThunk } from "../../../../global-state/thunks/folder-manager-thunks";
import { prefabAssetOpenedThunk } from "../../../../global-state/thunks/prefab-asset-thunk";
import { TextRow } from "./components";

export function PrefabAssetInspector(props: { inspector: PrefabAssetInspector }){
    const { assetInfo, prefabAsset } = props.inspector;
    const dispatch = useAppDispatch();
    return (
        <div className="p-1 overflow-auto scrollbar-thin flex flex-1 flex-col gap-1">
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
                Open prefab ({assetInfo.allowModify ? "modifiable" : "unmodifiable"})
            </button>
            {
                !assetInfo.allowModify &&
                <button className="text-white text-sm px-3 py-1 rounded-2xl bg-gray-600 cursor-pointer
                    transition hover:opacity-80"
                    onClick={() => {
                        dispatch(prefabDuplicatedThunk({
                            name: assetInfo.name,
                            prefabAsset
                        }));
                    }}
                >
                    Duplicate prefab (for modifiable)
                </button>
            }
        </div>
    );
}
