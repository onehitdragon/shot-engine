import type { mat3, mat4, vec3 } from "gl-matrix";
import { WebglMeshVBOs } from "./WebglMeshVBOs";
import { WebglSimpleShader } from "./WebglSimpleShader";
import { WebglHelper } from "./WebglHelper";
import { WebglPhongShader } from "./WebglPhongShader";

export class WebglMesh{
    private _gl: WebGL2RenderingContext;
    private _meshVBOs: WebglMeshVBOs;
    private _meshVAOMap: Map<Components.Shading["shaderType"], WebGLVertexArrayObject>;
    constructor(gl: WebGL2RenderingContext, meshResource: Resource.MeshBin){
        this._gl = gl;
        this._meshVBOs = new WebglMeshVBOs(gl, meshResource);
        this._meshVAOMap = new Map();
        this._meshVAOMap.set(
            "simple",
            WebglSimpleShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
        this._meshVAOMap.set(
            "phong",
            WebglPhongShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
    }
    renderWithSimpleShader(mvpMat4: mat4){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("simple")!;
        WebglSimpleShader.getInstance(gl).renderMesh(this._meshVBOs, vao, mvpMat4);
    }
    renderWithPhongShader(
        mvpMat4: mat4,
        modelMat4: mat4,
        normalMat3: mat3,
        camPos: vec3,
        shadingComponent: Components.PhongShading
    ){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("phong")!;
        WebglPhongShader.getInstance(gl).renderMesh(
            this._meshVBOs,
            vao,
            mvpMat4,
            modelMat4,
            normalMat3,
            camPos,
            shadingComponent
        );
    }
    dispose(){
        const gl = this._gl;
        this._meshVBOs.dispose();
        for(const vao of this._meshVAOMap.values()) WebglHelper.deleteVertexArray(gl, vao);
    }
}