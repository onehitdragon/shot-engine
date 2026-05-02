import { vec3 } from "gl-matrix";

export class LightSceneNodeManager{
    private static _instance: LightSceneNodeManager;
    static getInstance(){
        if(!this._instance) this._instance = new LightSceneNodeManager();
        return this._instance;
    }
    private _pointLightInfos: { position: vec3, color: vec3 }[] = [];
    private _directionalInfos: { dir: vec3, color: vec3 }[] = [];
    get pointLightInfos(){
        return this._pointLightInfos;
    }
    get directionalInfos(){
        return this._directionalInfos;
    }
    private constructor(){
    }
    private clear(){
        this._pointLightInfos = [];
        this._directionalInfos = [];
    }
    update(sceneNodes: SceneFormat.SceneNode[], componentRecord: Record<string, Components.Component>){
        this.clear();
        sceneNodes.forEach((sceneNode) => {
            const { components } = sceneNode;
            let transform: Components.Transform | null = null;
            let light: Components.Light | null = null;
            for(const componentId of components){
                const component = componentRecord[componentId];
                if(component.type === "Transform"){
                    transform = component;
                }
                if(component.type === "Light"){
                    light = component;
                }
            }
            if(!transform || !light) return;
            const { lightType } = light;
            if(lightType === "PointLight"){
                this._pointLightInfos.push({
                    position: transform.position,
                    color: light.color
                });
            }
            else if(lightType === "DirectionalLight"){
                this._directionalInfos.push({
                    dir: light.dir,
                    color: vec3.fromValues(1.0, 1.0, 1.0)
                });
            }
            else throw `${lightType} dont support`
        });
    }
}