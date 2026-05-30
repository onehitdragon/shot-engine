import { AssetCache } from "../../helpers/asset-cache/asset-cache";
import { ColorCache } from "../../helpers/asset-cache/color-cache";

export function ResourceManager(){
    const countRecord = AssetCache.getInstance().getCountRecord();

    return <div className='flex-1 flex overflow-hidden'>
        <div className="flex flex-col flex-1 overflow-auto scrollbar-thin p-1">
            <p className="select-none text-white text-xl font-bold">Resource</p>
            {
                countRecord.map(([type, assetInfos]) => {
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
            <h2 className="select-none text-white text-xl font-bold">Color Textures</h2>
            <ul className="flex-1 flex flex-col">
                {
                    ColorCache.getInstance().getKeys().map(colorKey => {
                        return <li key={colorKey} className="flex flex-col">
                            <p className="select-none text-white">{colorKey}</p>
                        </li>
                    })
                }
            </ul>
        </div>
    </div>;
}