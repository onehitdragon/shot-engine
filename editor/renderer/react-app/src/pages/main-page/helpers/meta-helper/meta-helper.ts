import type { Assets } from "../../../../engine-zod";

export function createOptions(assets: Assets.MetaObject[]){
    const options = assets.map((asset) => {
        return {
            label: asset.path.split(/[/\\]/).at(-1) || "",
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
