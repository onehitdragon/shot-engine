import type { Assets } from "../../../../engine-zod";
import { WebglResourceManager } from "../resource-manager-helper/WebglResourceManager";

export function disposeAssets(assets: Assets.Asset[]){
    for(const asset of assets){
        const { guid } = asset;
        WebglResourceManager.getInstance().tryDelete(guid);
    }
}
