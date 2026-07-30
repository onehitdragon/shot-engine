import type { DirectionalLight, Light, PointLight, SpotLight, Vec3 } from "@shot-engine/types";

export class LightInfo{
    private static _instance: LightInfo;
    static getInstance(){
        if(!this._instance) this._instance = new LightInfo();
        return this._instance;
    }
    private _directionalInfos: { light: DirectionalLight, pos: Vec3, forward: Vec3 }[] = [];
    private _pointLightInfos: { light: PointLight, pos: Vec3, forward: Vec3 }[] = [];
    private _spotLightInfos: { light: SpotLight, pos: Vec3, forward: Vec3 }[] = [];
    get directionalInfos(){
        return this._directionalInfos;
    }
    get pointLightInfos(){
        return this._pointLightInfos;
    }
    get spotLightInfos(){
        return this._spotLightInfos;
    }
    private constructor(){
    }
    addLight(light: Light, pos: Vec3, forward: Vec3){
        if(light.lightType === "DirectionalLight"){
            this._directionalInfos.push({ light, pos, forward });
        }
        if(light.lightType === "PointLight"){
            this._pointLightInfos.push({ light, pos, forward });
        }
        if(light.lightType === "SpotLight"){
            this._spotLightInfos.push({ light, pos, forward });
        }
    }
    public reset(){
        this._pointLightInfos = [];
        this._directionalInfos = [];
        this._spotLightInfos = [];
    }
}