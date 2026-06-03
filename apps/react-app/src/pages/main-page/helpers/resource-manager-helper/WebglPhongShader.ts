import { WebglHelper } from "./WebglHelper";
import phongShadingVShaderSource from "../shaders/phong-shader/vshader.glsl?raw";
import phongShadingFShaderSource from "../shaders/phong-shader/fshader.glsl?raw";
import type { mat3, mat4, vec3 } from "gl-matrix";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import type { HdrAsset, PhongShading } from "@shot-engine/types";
import { LightInfo } from "../asset-cache/LightInfo";
import { AssetCache } from "../asset-cache/asset-cache";
import { ColorCache } from "../asset-cache/color-cache";
import { SkyBoxInfo } from "../asset-cache/SkyBoxInfo";

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
    private _a_TextCoordLoc: number;
    private _u_CamWorldPosLoc: WebGLUniformLocation;
    private _u_specularLoc: WebGLUniformLocation;
    private _u_shininessLoc: WebGLUniformLocation;
    private _u_irradianceMapLoc: WebGLUniformLocation;
    private _u_prefilterMapLoc: WebGLUniformLocation;
    private _u_maxShininessLoc: WebGLUniformLocation;
    private _u_PointLightSizeLoc: WebGLUniformLocation;
    private _u_DirectionalLightSizeLoc: WebGLUniformLocation;
    private _u_DiffuseSampler: WebGLUniformLocation;
    private readonly NUM_LIGHTS = 32;
    private _programLoc: {
        u_PointLights: {
            position: WebGLUniformLocation,
            color: WebGLUniformLocation,
            intensity: WebGLUniformLocation,
            radius: WebGLUniformLocation,
        }[],
        u_DirectionalLights: {
            dir: WebGLUniformLocation,
            color: WebGLUniformLocation,
            intensity: WebGLUniformLocation,
            radius: WebGLUniformLocation,
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
        this._a_TextCoordLoc = WebglHelper.getAttrLocation(gl, program, "a_TextCoord");
        this._u_CamWorldPosLoc = WebglHelper.getUniformLocation(gl, program, "u_CamWorldPos");
        this._u_specularLoc = WebglHelper.getUniformLocation(gl, program, "u_specular");
        this._u_shininessLoc = WebglHelper.getUniformLocation(gl, program, "u_shininess");
        this._u_irradianceMapLoc = WebglHelper.getUniformLocation(gl, program, "u_irradianceMap");
        this._u_prefilterMapLoc = WebglHelper.getUniformLocation(gl, program, "u_prefilterMap");
        this._u_maxShininessLoc = WebglHelper.getUniformLocation(gl, program, "u_maxShininess");
        this._u_PointLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_PointLightSize");
        this._u_DirectionalLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_DirectionalLightSize");
        this._u_DiffuseSampler = WebglHelper.getUniformLocation(gl, program, "u_DiffuseSampler");
        this._programLoc = {
            u_PointLights: [],
            u_DirectionalLights: []
        };
        for(let i = 0; i < this.NUM_LIGHTS; i++){
            this._programLoc.u_PointLights.push({
                position: WebglHelper.getUniformLocation(gl, program, `u_PointLights[${i}].position`),
                color: WebglHelper.getUniformLocation(gl, program, `u_PointLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, program, `u_PointLights[${i}].intensity`),
                radius: WebglHelper.getUniformLocation(gl, program, `u_PointLights[${i}].radius`),
            });
            this._programLoc.u_DirectionalLights.push({
                dir: WebglHelper.getUniformLocation(gl, program, `u_DirectionalLights[${i}].dir`),
                color: WebglHelper.getUniformLocation(gl, program, `u_DirectionalLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, program, `u_DirectionalLights[${i}].intensity`),
                radius: WebglHelper.getUniformLocation(gl, program, `u_DirectionalLights[${i}].radius`),
            });
        }
    }
    createMeshVAOs(meshVBOs: WebglMeshVBOs){
        const gl = this._gl;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = (3 + 3 + 2) * 4; // (3 verter, 3 normal, 2 uv) * floatSize = 4
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            gl.vertexAttribPointer(this._a_NormalLoc, 3, gl.FLOAT, false, stride, 3 * 4);
            gl.enableVertexAttribArray(this._a_NormalLoc);
            gl.vertexAttribPointer(this._a_TextCoordLoc, 2, gl.FLOAT, false, stride, (3 + 3) * 4);
            gl.enableVertexAttribArray(this._a_TextCoordLoc);
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
        shadingComponent: PhongShading
    ){
        const gl = this._gl;
        const vbos = meshVBOs;
        const { pointLightInfos, directionalInfos } = LightInfo.getInstance();
        const { diffuse, specular, shininess } = shadingComponent;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_MvpMatrixLoc, false, mvpMat4);
        gl.uniformMatrix4fv(this._u_ModelMatrixLoc, false, modelMat4);
        gl.uniformMatrix3fv(this._u_NormalMatrixLoc, false, normalMat3);
        gl.uniform3fv(this._u_CamWorldPosLoc, camPos);
        gl.uniform3fv(this._u_specularLoc, [specular.x, specular.y, specular.z]);
        gl.uniform1f(this._u_shininessLoc, shininess);
        gl.uniform1i(this._u_PointLightSizeLoc, pointLightInfos.length);
        gl.uniform1i(this._u_DirectionalLightSizeLoc, directionalInfos.length);
        // todo: light local -> world position
        for(let i = 0; i < pointLightInfos.length; i++){
            const lightInfo = pointLightInfos[i];
            gl.uniform3fv(this._programLoc.u_PointLights[i].position, [lightInfo.position.x, lightInfo.position.y, lightInfo.position.z]);
            gl.uniform3fv(this._programLoc.u_PointLights[i].color, [lightInfo.color.x, lightInfo.color.y, lightInfo.color.z]);
            gl.uniform1f(this._programLoc.u_PointLights[i].intensity, lightInfo.intensity);
            gl.uniform1f(this._programLoc.u_PointLights[i].radius, lightInfo.radius);
        }
        for(let i = 0; i < directionalInfos.length; i++){
            const lightInfo = directionalInfos[i];
            gl.uniform3fv(this._programLoc.u_DirectionalLights[i].dir, [lightInfo.dir.x, lightInfo.dir.y, lightInfo.dir.z]);
            gl.uniform3fv(this._programLoc.u_DirectionalLights[i].color, [lightInfo.color.x, lightInfo.color.y, lightInfo.color.z]);
            gl.uniform1f(this._programLoc.u_DirectionalLights[i].intensity, lightInfo.intensity);
            gl.uniform1f(this._programLoc.u_DirectionalLights[i].radius, lightInfo.radius);
        }

        const diffuseWebglTexture = 
            diffuse.type === "image" ?
            AssetCache.getInstance().getWebglTexture(diffuse.imageRef) :
            ColorCache.getInstance().getWebglColorTexture(diffuse.color)
        ;
        if(!diffuseWebglTexture){
            console.warn("cant find diffuse texture");
            return;
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, diffuseWebglTexture.webglTexture);
        gl.uniform1i(this._u_DiffuseSampler, 0);

        let irradianceMap = ColorCache.getInstance().getEmptyWebglTextureCube();
        let prefilterMap = ColorCache.getInstance().getEmptyWebglTextureCube();
        let maxShininess = 0;
        const uniqueSkyBox = SkyBoxInfo.getInstance().uniqueSkyBox;
        if(uniqueSkyBox && uniqueSkyBox.hdrRef){
            const hdr = AssetCache.getInstance().getHdr(uniqueSkyBox.hdrRef);
            if(hdr && hdr.irradianceMap){
                irradianceMap = hdr.irradianceMap;
            }
            if(hdr && hdr.prefilterMap){
                prefilterMap = hdr.prefilterMap;
            }
            const hdrAsset = AssetCache.getInstance().getAssetCache(uniqueSkyBox.hdrRef)?.asset as HdrAsset;
            if(hdrAsset){
                maxShininess = hdrAsset.prefilterMap.maxShininess;
            }
        }
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, irradianceMap.webglTexture);
        gl.uniform1i(this._u_irradianceMapLoc, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, prefilterMap.webglTexture);
        gl.uniform1i(this._u_prefilterMapLoc, 2);
        gl.uniform1f(this._u_maxShininessLoc, maxShininess);

        gl.bindVertexArray(vao);
            gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
        gl.bindVertexArray(null);
    }
}