import type { SkyBox } from "@shot-engine/types";

export class SkyBoxInfo{
    private static _instance: SkyBoxInfo;
    static getInstance(){
        if(!this._instance) this._instance = new SkyBoxInfo();
        return this._instance;
    }
    private _uniqueSkyBox?: SkyBox;
    get uniqueSkyBox(){
        return this._uniqueSkyBox;
    }
    private constructor(){
    }
    public setSkyBox(skyBox: SkyBox){
        this._uniqueSkyBox = skyBox;
    }
    public reset(){
        this._uniqueSkyBox = undefined;
    }
}