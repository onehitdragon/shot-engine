import { AssetCache } from "../../helpers/asset-cache/asset-cache";

export function ResourceManager(){
    const countRecord = AssetCache.getInstance().getCountRecord();

    return <div className='flex-1 flex overflow-hidden'>
        <div className="flex flex-col flex-1 overflow-auto scrollbar-thin p-1">
            <p className="select-none text-white text-xl font-bold">Resource</p>
            {
                countRecord.map(([type, assetInfos], index) => {
                    return <div key={type}>
                        <p className="select-none text-white">{type}: {assetInfos.length}</p>
                        {
                            assetInfos.map(assetInfo => {
                                return <div key={assetInfo.uuid}>
                                    <p className="select-none text-white">
                                        uuid: {assetInfo.uuid}
                                    </p>
                                    <p className="select-none text-white">
                                        name: {assetInfo.name}
                                    </p>
                                </div>
                            })
                        }
                    </div>
                })
            }
            <h2 className="select-none text-white text-xl font-bold">Webgl Resourcee</h2>
            {/* <ul className="flex-1 flex flex-col gap-3">
                <li className="flex flex-col">
                    <p className="select-none text-white">
                        meshCount: {WebglResourceManager.getInstance().info().meshCount}
                    </p>
                    <p className="select-none text-white">
                        textureCount: {WebglResourceManager.getInstance().info().textureCount}
                    </p>
                </li>
            </ul> */}
        </div>
    </div>;
}