import type { Assets } from "../../../../engine-zod";
import { getBaseName } from "../utils/utils";

export function createOptions(assets: Assets.MetaObject[]){
    const options = assets.map((asset) => {
        return {
            label: getBaseName(asset.path),
            value: asset.asset.guid
        }
    });
    options.push({
        label: "None",
        value: ""
    });
    return options;
}
export function findGuid(guid: string, assets: Assets.MetaObject[]){
    if(!guid) return "";
    if(assets.find(ass => ass.asset.guid === guid)){
        return guid;
    }
    return "";
}
