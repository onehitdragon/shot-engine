import type { Light, Transform, Vec3 } from "@shot-engine/types";

export class LightInfo{
    private static _instance: LightInfo;
    static getInstance(){
        if(!this._instance) this._instance = new LightInfo();
        return this._instance;
    }
    private _pointLightInfos: { position: Vec3, color: Vec3 }[] = [];
    private _directionalInfos: { dir: Vec3, color: Vec3 }[] = [];
    get pointLightInfos(){
        return this._pointLightInfos;
    }
    get directionalInfos(){
        return this._directionalInfos;
    }
    private constructor(){
    }
    addLight(light: Light, transform: Transform){
        if(light.lightType === "PointLight"){
            this._pointLightInfos.push({
                position: transform.pos,
                color: light.color
            });
        }
        if(light.lightType === "DirectionalLight"){
            this._directionalInfos.push({
                dir: light.dir,
                color: { x: 1, y: 1, z: 1 }
            });
        }
    }
    public reset(){
        this._pointLightInfos = [];
        this._directionalInfos = [];
    }
}