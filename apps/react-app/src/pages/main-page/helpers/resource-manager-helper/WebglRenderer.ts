import type { mat3, mat4, vec3 } from "gl-matrix";
import { WebglGridShader } from "./WebglGridShader";
import type { Mesh, Shading } from "@shot-engine/types";
import { WebglMeshCache } from "../asset-cache/webgl-mesh-cache";
import { getSceneWebglContext } from "./CanvasHelper";

export class WebglRenderer{
    private static _instance: WebglRenderer;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglRenderer(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglGridShader: WebglGridShader;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        gl.enable(gl.DEPTH_TEST);
        this._webglGridShader = WebglGridShader.getInstance(gl);
    }
    render(
        shadingComponent: Shading,
        meshComponent: Mesh,
        mvpMat4: mat4,
        modelMat4: mat4,
        normalMat3: mat3,
        camPos: vec3
    ){
        const { shaderType, culling } = shadingComponent;
        this.culling(culling);
        const webglMeshs = WebglMeshCache.getInstance().getWebglMeshes(meshComponent.meshRef);
        if(!webglMeshs){
            console.warn("error while get webglmesh cache");
            return;
        }
        if(shaderType === "simple"){
            webglMeshs.forEach(e => e.renderWithSimpleShader(mvpMat4));
        }
        else if(shaderType === "phong"){
            webglMeshs.forEach(
                e => e.renderWithPhongShader(mvpMat4, modelMat4, normalMat3, camPos, shadingComponent)
            );
        }
        else{
            console.warn(`dont support shaderType: ${shaderType}`);
        }
    }
    renderGrid(vpMat4: mat4){
        // const gl = this._gl;
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // this._webglGridShader.render(vpMat4);
        // gl.disable(gl.BLEND);
    }
    clear(){
        const gl = getSceneWebglContext();
        gl.clearColor(0.5, 0.5, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    debug(){
        // const gl = this._gl;
        // const w = gl.drawingBufferWidth;
        // const h = gl.drawingBufferHeight;
        // console.log(w, h);
        // const pixels = new Uint8Array(w * h * 4);
        // gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        // console.log(pixels);
    }
    private culling(culling: Components.Shading["culling"]){
        const gl = this._gl;
        if(culling === "none"){
            gl.disable(gl.CULL_FACE);
        }
        else{
            gl.enable(gl.CULL_FACE);
            if(culling === "back") gl.cullFace(gl.BACK);
            else if(culling === "front") gl.cullFace(gl.FRONT);
            else if (culling === "both") gl.cullFace(gl.FRONT_AND_BACK);
        }
    }
}