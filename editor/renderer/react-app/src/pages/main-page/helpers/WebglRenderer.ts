import type { mat4 } from "gl-matrix";
import { WebglSimpleShader } from "./WebglSimpleShader";
import { WebglGridShader } from "./WebglGridShader";

export class WebglRenderer{
    private static _instance: WebglRenderer;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglRenderer(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglGridShader: WebglGridShader;
    private _simpleShader: WebglSimpleShader;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._webglGridShader = WebglGridShader.getInstance(gl);
        this._simpleShader = WebglSimpleShader.getInstance(gl);
    }
    render(
        shadingComponent: Components.Shading,
        meshComponent: Components.Mesh,
        mvpMat4: mat4
    ){
        const { shaderType } = shadingComponent;
        const { meshType } = meshComponent;
        if(shaderType == "simple"){
            if(meshType == "cube"){
                this._simpleShader.renderCube(mvpMat4);
            }
            else throw `dont support shaderType: ${shaderType}`;
        }
        else throw `dont support meshType: ${meshType}`;
    }
    renderGrid(vpMat4: mat4){
        this._webglGridShader.render(vpMat4);
    }
    clear(){
        const gl = this._gl;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}