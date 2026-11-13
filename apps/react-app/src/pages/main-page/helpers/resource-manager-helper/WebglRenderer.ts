import { WebglGridShader } from "./WebglGridShader";
import { getSceneWebglContext } from "./CanvasHelper";
import { WebglSkyBoxShader } from "./WebglSkyBoxShader";
import { WebglAxisShader } from "./WebglAxisShader";
import { Mat4 } from "@shot-engine/math";
import type { RenderNodeData } from "../../components/scene-tab/SceneRenderer";
import type { MaterialAsset } from "@shot-engine/types";
import { WebglSimpleShader } from "./WebglSimpleShader";
import { WebglPbrShader } from "./WebglPbrShader";

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
    render(renderNodeData: RenderNodeData){
        const { node, materialAsset, gpuResource } = renderNodeData;
        const { culling, matType } = materialAsset;

        // culling
        this.culling(culling);

        // distable depth test if gizmo
        const gl = this._gl;
        if(node.id.startsWith("gizmo-")){
            gl.disable(gl.DEPTH_TEST);
        }

        // render
        if(matType === "simple"){
            WebglSimpleShader.getInstance(this._gl).render(renderNodeData, gpuResource.webglMesh);
        }
        if(matType === "pbr"){
            WebglPbrShader.getInstance(this._gl).render(renderNodeData, gpuResource.webglMesh);
        }

        // reset culling
        this.culling("none");
        // reset depth test
        gl.enable(gl.DEPTH_TEST);
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
    private culling(culling: MaterialAsset["culling"]){
        const gl = this._gl;
        if(culling === "back"){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        }
        else if(culling === "front"){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);
        }
        else{
            gl.disable(gl.CULL_FACE);
        }
    }
}