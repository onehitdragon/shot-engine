import { isAssetFile, isAssetFolder, isAssetImage, isAssetMesh, isAssetPrefab, isAssetScene, type Assets } from "../../../../engine-zod";
import { useAppSelector } from "../../../../global-state/hooks";
import { selectAssets } from "../../../../global-state/slices/asset-manager-slice";

export function AssetManager(){
    const assets = useAppSelector(state => selectAssets(state));
    const getType = (asset: Assets.Asset) => {
        if(isAssetFolder(asset)){
            return <p className="select-none text-yellow-500">
                type: Folder
            </p>
        }
        if(isAssetFile(asset)){
            return <p className="select-none text-white">
                type: File
            </p>
        }
        if(isAssetImage(asset)){
            return <p className="select-none text-white">
                type: Image
            </p>
        }
        if(isAssetScene(asset)){
            return <p className="select-none text-white">
                type: Scene
            </p>
        }
        if(isAssetMesh(asset)){
            return <p className="select-none text-green-500">
                type: Mesh
            </p>
        }
        if(isAssetPrefab(asset)){
            return <p className="select-none text-red-500">
                type: Prefab
            </p>
        }
        return <p className="select-none text-white">
            type: Unknown
        </p>
    }

    return <div className='flex-1 flex overflow-hidden'>
        <div className="flex flex-col flex-1 overflow-auto scrollbar-thin p-1">
            <p className="select-none text-white text-xl font-bold">Assets</p>
            <ul className="flex flex-col gap-3">
                {
                    assets.map(({ path, asset }) => {
                        return (
                            <li key={asset.guid} className="flex flex-col">
                                {getType(asset)}
                                <p className="select-none text-white">
                                    path: {path}
                                </p>
                                <p className="select-none text-white">
                                    guid: {asset.guid}
                                </p>
                                <p className="select-none text-white">
                                    asset: {JSON.stringify(asset, null, 2)}
                                </p>
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    </div>
}