import { useEffect } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { selectAssets } from "../../../../global-state/slices/asset-manager-slice";
import { WebglTextureManager } from "../../helpers/WebglTextureManager";
import { getSceneWebglContext } from "../../helpers/CanvasHelper";

export function AssetManager(){
    const assets = useAppSelector(state => selectAssets(state));
    const scene = useAppSelector(state => state.sceneManager.scene);
    useEffect(() => {
        let cancel = false;
        const handle = async () => {
            await WebglTextureManager.getInstance(getSceneWebglContext()).update(assets, scene);
            if(!cancel){
                
            }
        }
        handle();
        return () => {
            cancel = true;
        }
    }, [assets, scene])
    return (
        <div></div>
    );
}