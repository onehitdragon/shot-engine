import type { mat4 } from "gl-matrix";
import { WebglMeshVBOs } from "./WebglMeshVBOs";
import { WebglSimpleShader } from "./WebglSimpleShader";
import { WebglHelper } from "./WebglHelper";

export class WebglMesh{
    private _gl: WebGL2RenderingContext;
    private _meshVBOs: WebglMeshVBOs;
    private _meshVAOMap: Map<string, WebGLVertexArrayObject>;
    constructor(gl: WebGL2RenderingContext, mesh: SceneFormat.Mesh){
        this._gl = gl;
        this._meshVBOs = new WebglMeshVBOs(gl, mesh);
        this._meshVAOMap = new Map<string, WebGLVertexArrayObject>();
        this._meshVAOMap.set(
            "simpleShader",
            WebglSimpleShader.getInstance(gl).createMeshVAOs(this._meshVBOs)
        );
    }
    renderWithSimpleShader(mvpMat4: mat4){
        const gl = this._gl;
        const vao = this._meshVAOMap.get("simpleShader")!;
        WebglSimpleShader.getInstance(gl).renderMesh(this._meshVBOs, vao, mvpMat4);
    }
    dispose(){
        const gl = this._gl;
        this._meshVBOs.dispose();
        for(const vao of this._meshVAOMap.values()) WebglHelper.deleteVertexArray(gl, vao);
    }
}