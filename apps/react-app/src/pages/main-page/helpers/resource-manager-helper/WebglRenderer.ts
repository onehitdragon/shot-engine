import { WebglGridShader } from "./WebglGridShader";
import type { Mat3, Mat4, Mesh, Shading, Vec3 } from "@shot-engine/types";
import { getSceneWebglContext } from "./CanvasHelper";
import { AssetCache } from "../asset-cache/asset-cache";
import { WebglSkyBoxShader } from "./WebglSkyBoxShader";
import { WebglAxisShader } from "./WebglAxisShader";

export class WebglRenderer{
    private static _instance: WebglRenderer;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglRenderer(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _webglSkyBoxShader: WebglSkyBoxShader;
    private _webglGridShader: WebglGridShader;
    private _webglAxisShader: WebglAxisShader;
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        this._webglGridShader = WebglGridShader.getInstance(gl);
        this._webglSkyBoxShader = WebglSkyBoxShader.getInstance(gl);
        this._webglAxisShader = WebglAxisShader.getInstance(gl);
    }
    render(
        shadingComponent: Shading,
        meshComponent: Mesh,
        mvpMat4: Mat4,
        modelMat4: Mat4,
        normalMat3: Mat3,
        camPos: Vec3
    ){
        const { shaderType, culling } = shadingComponent;
        this.culling(culling);
        const webglMeshs = AssetCache.getInstance().getWebglMeshes(meshComponent.meshRef);
        if(!webglMeshs){
            console.warn("error while get webglmesh cache");
            return;
        }
        if(shaderType === "simple"){
            webglMeshs.forEach(e => e.renderWithSimpleShader(mvpMat4, shadingComponent.color));
        }
        else if(shaderType === "phong"){
            webglMeshs.forEach(
                e => e.renderWithPhongShader(mvpMat4, modelMat4, normalMat3, camPos, shadingComponent)
            );
        }
        else if(shaderType === "pbr"){
            webglMeshs.forEach(
                e => e.renderWithPbrShader(mvpMat4, modelMat4, normalMat3, camPos, shadingComponent)
            );
        }
        else if(shaderType === "gizmo"){
            webglMeshs.forEach(
                e => e.renderWithGizmoShader(mvpMat4, shadingComponent)
            );
        }
        else{
            console.warn(`dont support shaderType: ${shaderType}`);
        }
        this.culling("none"); // reset
    }
    renderSkyBox(viewMat4: Mat4, clipMat4: Mat4){
        this._webglSkyBoxShader.render(viewMat4, clipMat4);
    }
    renderAxis(vpMat4: Mat4){
        this._webglAxisShader.render(vpMat4);
    }
    renderGrid(vpMat4: Mat4){
        this._webglGridShader.render(vpMat4);
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
    private culling(culling: Shading["culling"]){
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