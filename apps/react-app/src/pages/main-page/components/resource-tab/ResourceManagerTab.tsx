import { getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { ResourceManager } from "./ResourceManager";

export function ResourceManagerTab(){
    try{
        getSceneWebglContext();
    }
    catch(err){
        return <div>{err as any}</div>;
    }
    return <ResourceManager />;
}