import { getSceneWebglContext } from "../resource-manager-helper/CanvasHelper";
import { WebglTexture } from "../resource-manager-helper/WebglTexture";

export class DefaultWebglTexture{
    private static _instance: DefaultWebglTexture;
    static getInstance(){
        if(!this._instance) this._instance = new DefaultWebglTexture(getSceneWebglContext());
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    public _whiteWebglTexture: WebglTexture;
    public _normalWebglTexture: WebglTexture;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._whiteWebglTexture = WebglTexture.CreateWithColor(gl, new Uint8Array([255, 255, 255, 255]));
        this._normalWebglTexture = WebglTexture.CreateWithColor(gl, new Uint8Array([128, 128, 255, 255]));
    }
}