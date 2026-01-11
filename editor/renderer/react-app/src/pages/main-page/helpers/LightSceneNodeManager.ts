import { sceneGraphLooper } from "./SceneGraphHelper";

export class LightSceneNodeManager{
    private static _instance: LightSceneNodeManager;
    static getInstance(){
        if(!this._instance) this._instance = new LightSceneNodeManager();
        return this._instance;
    }
    private _pointLightSceneNodes: SceneFormat.SceneNode[] = [];
    private _directionalLightSceneNodes: SceneFormat.SceneNode[] = [];
    get pointLightSceneNodes(){
        return this._pointLightSceneNodes;
    }
    get directionalLightSceneNodes(){
        return this._directionalLightSceneNodes;
    }
    private constructor(){
    }
    private clear(){
        this._pointLightSceneNodes = [];
        this._directionalLightSceneNodes = [];
    }
    update(sceneNodes: SceneFormat.SceneNode[]){
        this.clear();
        sceneGraphLooper(sceneNodes, (sceneNode) => {
            const { components } = sceneNode;
            const lightComponent = components.find((c): c is Components.Light => c.type === "Light");
            if(!lightComponent) return;
            const { lightType } = lightComponent;
            if(lightType === "PointLight") this._pointLightSceneNodes.push(sceneNode);
            else if(lightType === "DirectionalLight") this._directionalLightSceneNodes.push(sceneNode);
            else throw `${lightType} dont support`
        });
    }
}