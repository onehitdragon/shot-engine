import type { mat4 } from "gl-matrix";
import { WebglGridShader } from "./WebglGridShader";
import { WebglMeshManager } from "./WebglMeshManager";

export class WebglRenderer{
    private static _instance: WebglRenderer;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglRenderer(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglGridShader: WebglGridShader;
    private _webglMeshManager: WebglMeshManager;
    get webglMeshManager(){
        return this._webglMeshManager;
    }
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._webglGridShader = WebglGridShader.getInstance(gl);
        this._webglMeshManager = WebglMeshManager.getInstance(gl);
    }
    render(
        shadingComponent: Components.Shading,
        meshComponent: Components.Mesh,
        mvpMat4: mat4
    ){
        const { shaderType } = shadingComponent;
        const { meshId } = meshComponent;
        const webglMesh = this._webglMeshManager.getWebglMesh(meshId);
        if(shaderType === "simple"){
            webglMesh.renderWithSimpleShader(mvpMat4);
        }
        else throw `dont support shaderType: ${shaderType}`;
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