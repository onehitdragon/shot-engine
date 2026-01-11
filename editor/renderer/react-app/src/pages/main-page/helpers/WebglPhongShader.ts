import { WebglHelper } from "./WebglHelper";
import phongShadingVShaderSource from "./shaders/phong-shader/vshader.glsl?raw";
import phongShadingFShaderSource from "./shaders/phong-shader/fshader.glsl?raw";
import type { mat3, mat4, vec3 } from "gl-matrix";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import { LightSceneNodeManager } from "./LightSceneNodeManager";
import { getDirectionalLightInfo, getPointLightInfo } from "./LighSceneNodeHelper";

export class WebglPhongShader{
    private static _instance: WebglPhongShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglPhongShader(gl);
        return this._instance;
    }
    private _gl: WebGL2RenderingContext;
    private _program: WebGLProgram;
    private _u_MvpMatrixLoc: WebGLUniformLocation;
    private _u_ModelMatrixLoc: WebGLUniformLocation;
    private _u_NormalMatrixLoc: WebGLUniformLocation;
    private _a_PositionLoc: number;
    private _a_NormalLoc: number;
    private _u_CamWorldPosLoc: WebGLUniformLocation;
    private _u_ambientLoc: WebGLUniformLocation;
    private _u_shininessLoc: WebGLUniformLocation;
    private _u_PointLightSizeLoc: WebGLUniformLocation;
    private _u_DirectionalLightSizeLoc: WebGLUniformLocation;
    private readonly NUM_LIGHTS = 32;
    private _programLoc: {
        u_PointLights: {
            position: WebGLUniformLocation,
            color: WebGLUniformLocation
        }[],
        u_DirectionalLights: {
            dir: WebGLUniformLocation,
            color: WebGLUniformLocation
        }[]
    }
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._program = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: phongShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: phongShadingFShaderSource },
            ]
        );
        const program = this._program;
        this._u_MvpMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_MvpMatrix");
        this._u_ModelMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_ModelMatrix");
        this._u_NormalMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_NormalMatrix");
        this._a_PositionLoc = WebglHelper.getAttrLocation(gl, program, "a_Position");
        this._a_NormalLoc = WebglHelper.getAttrLocation(gl, program, "a_Normal");
        this._u_CamWorldPosLoc = WebglHelper.getUniformLocation(gl, program, "u_CamWorldPos");
        this._u_ambientLoc = WebglHelper.getUniformLocation(gl, program, "u_ambient");
        this._u_shininessLoc = WebglHelper.getUniformLocation(gl, program, "u_shininess");
        this._u_PointLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_PointLightSize");
        this._u_DirectionalLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_DirectionalLightSize");
        this._programLoc = {
            u_PointLights: [],
            u_DirectionalLights: []
        };
        for(let i = 0; i < this.NUM_LIGHTS; i++){
            this._programLoc.u_PointLights.push({
                position: WebglHelper.getUniformLocation(gl, program, `u_PointLights[${i}].position`),
                color: WebglHelper.getUniformLocation(gl, program, `u_PointLights[${i}].color`)
            });
            this._programLoc.u_DirectionalLights.push({
                dir: WebglHelper.getUniformLocation(gl, program, `u_DirectionalLights[${i}].dir`),
                color: WebglHelper.getUniformLocation(gl, program, `u_DirectionalLights[${i}].color`)
            });
        }
    }
    createMeshVAOs(meshVBOs: WebglMeshVBOs){
        const gl = this._gl;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            vbos.bindNormalVBO();
            gl.vertexAttribPointer(this._a_NormalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this._a_NormalLoc);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    renderMesh(
        meshVBOs: WebglMeshVBOs,
        vao: WebGLVertexArrayObject,
        mvpMat4: mat4,
        modelMat4: mat4,
        normalMat3: mat3,
        camPos: vec3,
        shadingComponent: Components.PhongShading
    ){
        const gl = this._gl;
        const vbos = meshVBOs;
        const { pointLightSceneNodes, directionalLightSceneNodes } = LightSceneNodeManager.getInstance();
        const { ambient, shininess } = shadingComponent;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_MvpMatrixLoc, false, mvpMat4);
        gl.uniformMatrix4fv(this._u_ModelMatrixLoc, false, modelMat4);
        gl.uniformMatrix3fv(this._u_NormalMatrixLoc, false, normalMat3);
        gl.uniform3fv(this._u_CamWorldPosLoc, camPos);
        gl.uniform3fv(this._u_ambientLoc, ambient);
        gl.uniform1f(this._u_shininessLoc, shininess);
        gl.uniform1i(this._u_PointLightSizeLoc, pointLightSceneNodes.length);
        gl.uniform1i(this._u_DirectionalLightSizeLoc, directionalLightSceneNodes.length);
        for(let i = 0; i < pointLightSceneNodes.length; i++){
            const sceneNode = pointLightSceneNodes[i];
            const lightInfo = getPointLightInfo(sceneNode);
            gl.uniform3fv(this._programLoc.u_PointLights[i].position, lightInfo.position);
            gl.uniform3fv(this._programLoc.u_PointLights[i].color, lightInfo.color);
        }
        for(let i = 0; i < directionalLightSceneNodes.length; i++){
            const sceneNode = directionalLightSceneNodes[i];
            const lightInfo = getDirectionalLightInfo(sceneNode);
            gl.uniform3fv(this._programLoc.u_DirectionalLights[i].dir, lightInfo.dir);
            gl.uniform3fv(this._programLoc.u_DirectionalLights[i].color, lightInfo.color);
        }
        gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, vbos.vertexIndices.length, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
    }
}