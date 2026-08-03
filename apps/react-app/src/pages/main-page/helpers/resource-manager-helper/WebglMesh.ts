import { WebglMeshVBOs } from "./WebglMeshVBOs";
import { WebglSimpleShader } from "./WebglSimpleShader";
import { WebglHelper } from "./WebglHelper";
import { WebglPhongShader } from "./WebglPhongShader";
import type { GizmoShading, Mat3, Mat4, MeshAsset, PbrShading, PhongShading, Shading, Vec3 } from "@shot-engine/types";
import { WebglPbrShader } from "./WebglPbrShader";
import { WebglGizmoShader } from "./WebglGizmoShader";
import { WebglShadowMapShader } from "./WebglShadowMapShader";

export class WebglMesh{
    private _gl: WebGL2RenderingContext;
    private _meshVBOs: WebglMeshVBOs;
    private _meshVAOMap: Map<Shading["shaderType"] | "shadowMap", WebGLVertexArrayObject>;
    constructor(gl: WebGL2RenderingContext, primitive: MeshAsset["primitives"][0]){
        this._gl = gl;
        this._meshVBOs = new WebglMeshVBOs(gl, primitive);
        this._meshVAOMap = new Map();
        this._meshVAOMap.set(
            "simple",
            WebglSimpleShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
        this._meshVAOMap.set(
            "phong",
            WebglPhongShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
        this._meshVAOMap.set(
            "pbr",
            WebglPbrShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
        this._meshVAOMap.set(
            "gizmo",
            WebglGizmoShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
        this._meshVAOMap.set(
            "shadowMap",
            WebglShadowMapShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
    }
    renderWithSimpleShader(mvpMat4: Mat4, color?: Vec3){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("simple")!;
        WebglSimpleShader.getInstance(gl).renderMesh(this._meshVBOs, vao, mvpMat4, color);
    }
    renderWithPhongShader(
        mvpMat4: Mat4,
        modelMat4: Mat4,
        normalMat3: Mat3,
        camPos: Vec3,
        shadingComponent: PhongShading
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
    renderWithPbrShader(
        mvpMat4: Mat4,
        modelMat4: Mat4,
        viewMat4: Mat4,
        normalMat3: Mat3,
        camPos: Vec3,
        shadingComponent: PbrShading
    ){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("pbr")!;
        WebglPbrShader.getInstance(gl).renderMesh(
            this._meshVBOs,
            vao,
            mvpMat4,
            modelMat4,
            viewMat4,
            normalMat3,
            camPos,
            shadingComponent
        );
    }
    renderWithGizmoShader(
        mvpMat4: Mat4,
        shadingComponent: GizmoShading
    ){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("gizmo")!;
        WebglGizmoShader.getInstance(gl).renderMesh(
            this._meshVBOs,
            vao,
            mvpMat4,
            shadingComponent
        );
    }
    renderWithShadowMapShader(
        lightVPMat4: Mat4,
        modelMat4: Mat4
    ){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("shadowMap")!;
        WebglShadowMapShader.getInstance(gl).renderMesh(
            this._meshVBOs,
            vao,
            lightVPMat4,
            modelMat4
        );
    }
    dispose(){
        const gl = this._gl;
        this._meshVBOs.dispose();
        for(const vao of this._meshVAOMap.values()) WebglHelper.deleteVertexArray(gl, vao);
    }
}