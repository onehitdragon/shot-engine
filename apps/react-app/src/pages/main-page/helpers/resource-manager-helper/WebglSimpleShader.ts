import { WebglHelper } from "./WebglHelper";
import simpleShadingVShaderSource from "../shaders/simple-shader/vshader.glsl?raw";
import simpleShadingFShaderSource from "../shaders/simple-shader/fshader.glsl?raw";
import simpleSkinShadingVShaderSource from "../shaders/simple-shader/vshader-skin.glsl?raw";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import type { MeshAsset, SimpleMaterialAsset } from "@shot-engine/types";
import { v4 as uuidv4 } from "uuid";
import { WebglMesh } from "./WebglMesh";
import type { RenderNodeData } from "../../components/scene-tab/SceneRenderer";

type ShaderContext = {
    program: WebGLProgram,
    // vertex
    u_MvpMatrixLoc: WebGLUniformLocation,
    // fragment
    u_transparentModeLoc: WebGLUniformLocation,
    u_alphaCutoffLoc: WebGLUniformLocation,
    u_colorLoc: WebGLUniformLocation,
}
export class WebglSimpleShader{
    private static _instance: WebglSimpleShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglSimpleShader(gl);
        return this._instance;
    }
    private _vaoId: string;
    private _skinnedVAOId: string;
    private _gl: WebGL2RenderingContext;
    private _program: ShaderContext;
    // private _skinProgram: {
    //     program: WebGLProgram,
    //     u_vpMatrixLoc: WebGLUniformLocation,
    //     u_invBindPoseMatrixLoc: WebGLUniformLocation
    //     u_jointMatrixLoc: WebGLUniformLocation,
    //     a_PositionLoc: number,
    //     a_WeightLoc: number,
    //     a_JointLoc: number,
    //     u_color: WebGLUniformLocation,
    // };
    private constructor(gl: WebGL2RenderingContext){
        this._vaoId = uuidv4();
        this._skinnedVAOId = uuidv4();
        this._gl = gl;

        const simpleProgram = WebglHelper.createProgram(gl,
            [
                {
                    type: gl.VERTEX_SHADER,
                    source: simpleShadingVShaderSource
                },
                {
                    type: gl.FRAGMENT_SHADER,
                    source: simpleShadingFShaderSource
                },
            ]
        )
        this._program = {
            program: simpleProgram,
            u_MvpMatrixLoc: WebglHelper.getUniformLocation(gl, simpleProgram, "u_MvpMatrix"),
            u_transparentModeLoc: WebglHelper.getUniformLocation(gl, simpleProgram, "u_transparentMode"),
            u_alphaCutoffLoc: WebglHelper.getUniformLocation(gl, simpleProgram, "u_alphaCutoff"),
            u_colorLoc: WebglHelper.getUniformLocation(gl, simpleProgram, "u_color"),
        }

        // const skinProgram = WebglHelper.createProgram(
        //     gl,
        //     [
        //         { type: gl.VERTEX_SHADER, source: simpleSkinShadingVShaderSource },
        //         { type: gl.FRAGMENT_SHADER, source: simpleShadingFShaderSource },
        //     ]
        // );
        // this._skinProgram = {
        //     program: skinProgram,
        //     u_vpMatrixLoc: WebglHelper.getUniformLocation(gl, skinProgram, "u_vpMatrix"),
        //     u_invBindPoseMatrixLoc: WebglHelper.getUniformLocation(
        //         gl, skinProgram, "u_invBindPoseMatrix[0]"
        //     ),
        //     u_jointMatrixLoc: WebglHelper.getUniformLocation(
        //         gl, skinProgram, "u_jointMatrix[0]"
        //     ),
        //     a_PositionLoc: WebglHelper.getAttrLocation(gl, skinProgram, "a_Position"),
        //     a_WeightLoc: WebglHelper.getAttrLocation(gl, skinProgram, "a_Weight"),
        //     a_JointLoc: WebglHelper.getAttrLocation(gl, skinProgram, "a_Joint"),
        //     u_color: WebglHelper.getUniformLocation(gl, skinProgram, "u_color"),
        // }
    }
    private createMeshVAO(
        gl: WebGL2RenderingContext,
        primitive: MeshAsset["primitives"][0],
        meshVBOs: WebglMeshVBOs,
    ){
        const { position, normal, uv, tangent, joint, weight } = primitive.attribute;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = position.itemSize + normal.itemSize + uv.itemSize + tangent.itemSize + joint.itemSize + weight.itemSize;
            gl.vertexAttribPointer(0, 3, position.type, position.normalized, stride, 0);
            gl.enableVertexAttribArray(0);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    // private createSkinnedMeshVAO(primitive: MeshAsset["primitives"][0], meshVBOs: WebglMeshVBOs){
    //     const gl = this._gl;
    //     const { program, u_invBindPoseMatrixLoc, a_PositionLoc, a_WeightLoc, a_JointLoc } = this._skinProgram;
    //     const vbos = meshVBOs;
    //     const vao = gl.createVertexArray();
    //     gl.bindVertexArray(vao);
    //         vbos.bindVertexVBO();
    //         const stride = 68; // (pos, normal, uv, tangent)48bytes (weight)16bytes (joint)4bytes
    //         gl.vertexAttribPointer(a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
    //         gl.enableVertexAttribArray(a_PositionLoc);
    //         gl.vertexAttribPointer(a_WeightLoc, 4, gl.FLOAT, false, stride, 44);
    //         gl.enableVertexAttribArray(a_WeightLoc);
    //         gl.vertexAttribIPointer(a_JointLoc, 4, gl.UNSIGNED_BYTE, stride, 60);
    //         gl.enableVertexAttribArray(a_JointLoc);
    //         vbos.bindIndexVBO();
    //     gl.bindVertexArray(null);

    //     gl.useProgram(program);
    //     gl.uniformMatrix4fv(u_invBindPoseMatrixLoc, false, invBindPoseMatrices);
    //     gl.useProgram(null);

    //     return vao;
    // }
    private renderMesh(renderNodeData: RenderNodeData, webglMesh: WebglMesh){
        const { primitive, materialAsset, transforms } = renderNodeData;
        const { mvpMat4 } = transforms;
        const { transparent, alphaCutoff, color } = materialAsset as SimpleMaterialAsset;

        // get vao
        const vao = webglMesh.getMeshVAO(this._vaoId, this.createMeshVAO);

        // set uniforms
        const gl = this._gl;
        const shaderContext = this._program;
        const { program, u_MvpMatrixLoc, u_transparentModeLoc, u_alphaCutoffLoc, u_colorLoc } = shaderContext;
        gl.useProgram(program);
        gl.uniformMatrix4fv(u_MvpMatrixLoc, false, mvpMat4.values);
        if(transparent === "opaque") gl.uniform1i(u_transparentModeLoc, 0);
        else if(transparent === "mask") gl.uniform1i(u_transparentModeLoc, 1);
        else gl.uniform1i(u_transparentModeLoc, 2);
        gl.uniform1f(u_alphaCutoffLoc, alphaCutoff);
        gl.uniform4fv(u_colorLoc, color.values);

        // render
        if(transparent === "blend"){
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        gl.bindVertexArray(vao);
            gl.drawElements(primitive.drawMode, primitive.indexCount, primitive.indexType, 0);
        gl.bindVertexArray(null);
        gl.disable(gl.BLEND);
    }
    // private renderSkinMesh(renderNodeData: RenderNodeData, vao: WebGLVertexArrayObject){
    //     const gl = this._gl;
    //     const { program, u_vpMatrixLoc, u_jointMatrixLoc, u_color } = this._skinProgram;
    //     const vbos = meshVBOs;
    //     gl.useProgram(program);
    //     gl.uniformMatrix4fv(u_vpMatrixLoc, false, vpMat4.values);
    //     gl.uniformMatrix4fv(u_jointMatrixLoc, false, jointMatrices);
    //     gl.uniform4fv(u_color, simpleShading.color.values);

    //     if(simpleShading.transparent){
    //         gl.enable(gl.BLEND);
    //         gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //     }
    //     gl.bindVertexArray(vao);
    //         gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
    //     gl.bindVertexArray(null);
    //     gl.disable(gl.BLEND);
    // }
    public render(renderNodeData: RenderNodeData, webglMesh: WebglMesh){
        const { rendererComponent } = renderNodeData;
        if(rendererComponent.type === "MeshRenderer"){
            this.renderMesh(renderNodeData, webglMesh);
        }
        else if(rendererComponent.type === "SkinnedMeshRenderer"){
            // const vao = webglMesh.getMeshVAO(this._skinnedVAOId, this.createSkinnedMeshVAO);
            // this.renderSkinMesh(renderNodeData, vao);
        }
    }
}