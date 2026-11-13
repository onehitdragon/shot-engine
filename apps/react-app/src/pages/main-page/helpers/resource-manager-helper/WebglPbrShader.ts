import { WebglHelper } from "./WebglHelper";
import pbrShadingVShaderSource from "../shaders/pbr-shader/vshader.glsl?raw";
import pbrShadingFShaderSource from "../shaders/pbr-shader/fshader.glsl?raw";
import { WebglMeshVBOs } from "./WebglMeshVBOs";
import { LightInfo } from "../asset-cache/LightInfo";
import { AssetCache } from "../asset-cache/asset-cache";
import { SkyBoxInfo } from "../asset-cache/SkyBoxInfo";
import type { MeshAsset, PbrMaterialAsset } from "@shot-engine/types";
import type { RenderNodeData } from "../../components/scene-tab/SceneRenderer";
import { WebglMesh } from "./WebglMesh";
import { v4 as uuidv4 } from "uuid";
import { DefaultWebglTexture } from "../asset-cache/default-webgltexture";
import { WebglTexture } from "./WebglTexture";

type ShaderContext = {
    program: WebGLProgram,
    // vertex
    u_MvpMatrixLoc: WebGLUniformLocation,
    u_ModelMatrixLoc: WebGLUniformLocation,
    u_NormalMatrixLoc: WebGLUniformLocation,
    // fragment
    u_baseMapLoc: WebGLUniformLocation, 
    u_baseFactorLoc: WebGLUniformLocation,
    u_metallicRoughnessMapLoc: WebGLUniformLocation,
    u_roughnessFactorLoc: WebGLUniformLocation,
    u_metallicFactorLoc: WebGLUniformLocation,
    u_normalMapLoc: WebGLUniformLocation,
    u_normalScaleLoc: WebGLUniformLocation,
    u_emissiveMapLoc: WebGLUniformLocation,
    u_emissiveFactorLoc: WebGLUniformLocation,
    u_aoMapLoc: WebGLUniformLocation,
    u_aoStrengthLoc: WebGLUniformLocation,
    // other
    u_CamWorldPosLoc: WebGLUniformLocation,
    u_reflectanceLoc: WebGLUniformLocation,
    // ambient
    u_hasIBL: WebGLUniformLocation,
    u_irradianceMapLoc: WebGLUniformLocation,
    u_prefilterMapLoc: WebGLUniformLocation,
    u_brdfLUTLoc: WebGLUniformLocation,
    // light
    u_directionalLightSizeLoc: WebGLUniformLocation,
    u_pointLightSizeLoc: WebGLUniformLocation,
    u_spotLightSizeLoc: WebGLUniformLocation,
    programLoc: {
        u_directionalLights: {
            color: WebGLUniformLocation,
            intensity: WebGLUniformLocation,
            dir: WebGLUniformLocation, // other
            hasShadow: WebGLUniformLocation,
            bias: WebGLUniformLocation,
            normalBias: WebGLUniformLocation,
            softShadow: WebGLUniformLocation
        }[],
        u_viewMat4: WebGLUniformLocation,
        u_cascadeCount: WebGLUniformLocation,
        u_cascadeFars: WebGLUniformLocation[],
        u_cascadeVPs: WebGLUniformLocation[],
        u_cascadeShadowMap: WebGLUniformLocation,

        u_pointLights: {
            color: WebGLUniformLocation,
            intensity: WebGLUniformLocation,
            radius: WebGLUniformLocation,
            position: WebGLUniformLocation, // other
        }[],
        u_spotLights: {
            color: WebGLUniformLocation,
            intensity: WebGLUniformLocation,
            radius: WebGLUniformLocation,
            innerAngle: WebGLUniformLocation,
            outerAngle: WebGLUniformLocation,
            position: WebGLUniformLocation, // other
            dir: WebGLUniformLocation,
        }[],
    },
    // alpha
    u_transparentModeLoc: WebGLUniformLocation,
    u_alphaCutoffLoc: WebGLUniformLocation,
}
export class WebglPbrShader{
    private static _instance: WebglPbrShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglPbrShader(gl);
        return this._instance;
    }
    private _vaoId: string;
    private _skinnedVAOId: string;
    private _gl: WebGL2RenderingContext;
    private _program: ShaderContext;
    private readonly NUM_LIGHTS = 32;
    private constructor(gl: WebGL2RenderingContext){
        this._vaoId = uuidv4();
        this._skinnedVAOId = uuidv4();
        this._gl = gl;
        const pbrProgram = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: pbrShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: pbrShadingFShaderSource },
            ]
        );
        this._program = {
            program: pbrProgram,
            // vertex
            u_MvpMatrixLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_MvpMatrix"),
            u_ModelMatrixLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_ModelMatrix"),
            u_NormalMatrixLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_NormalMatrix"),
            // fragment
            u_baseMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_baseMap"), 
            u_baseFactorLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_baseFactor"),
            u_metallicRoughnessMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_metallicRoughnessMap"),
            u_roughnessFactorLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_roughnessFactor"),
            u_metallicFactorLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_metallicFactor"),
            u_normalMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_normalMap"),
            u_normalScaleLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_normalScale"),
            u_emissiveMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_emissiveMap"),
            u_emissiveFactorLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_emissiveFactor"),
            u_aoMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_aoMap"),
            u_aoStrengthLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_aoStrength"),
            // other
            u_CamWorldPosLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_CamWorldPos"),
            u_reflectanceLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_reflectance"),
            // ambient
            u_hasIBL: WebglHelper.getUniformLocation(gl, pbrProgram, "u_hasIBL"),
            u_irradianceMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_irradianceMap"),
            u_prefilterMapLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_prefilterMap"),
            u_brdfLUTLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_brdfLUT"),
            // light
            u_directionalLightSizeLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_directionalLightSize"),
            u_pointLightSizeLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_pointLightSize"),
            u_spotLightSizeLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_spotLightSize"),
            programLoc: {
                u_directionalLights: [],
                u_viewMat4: -1,
                u_cascadeCount: -1,
                u_cascadeFars: [],
                u_cascadeVPs: [],
                u_cascadeShadowMap: -1,

                u_pointLights: [],
                u_spotLights: [],
            },
            // alpha
            u_transparentModeLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_transparentMode"),
            u_alphaCutoffLoc: WebglHelper.getUniformLocation(gl, pbrProgram, "u_alphaCutoff"),
        }
        for(let i = 0; i < this.NUM_LIGHTS; i++){
            this._program.programLoc.u_directionalLights.push({
                color: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].intensity`),
                dir: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].dir`),
                hasShadow: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].hasShadow`),
                bias: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].bias`),
                normalBias: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].normalBias`),
                softShadow: WebglHelper.getUniformLocation(gl, pbrProgram, `u_directionalLights[${i}].softShadow`),
            });
            this._program.programLoc.u_pointLights.push({
                color: WebglHelper.getUniformLocation(gl, pbrProgram, `u_pointLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, pbrProgram, `u_pointLights[${i}].intensity`),
                radius: WebglHelper.getUniformLocation(gl, pbrProgram, `u_pointLights[${i}].radius`),
                position: WebglHelper.getUniformLocation(gl, pbrProgram, `u_pointLights[${i}].position`),
            });
            this._program.programLoc.u_spotLights.push({
                color: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].intensity`),
                radius: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].radius`),
                innerAngle: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].innerAngle`),
                outerAngle: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].outerAngle`),
                position: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].position`),
                dir: WebglHelper.getUniformLocation(gl, pbrProgram, `u_spotLights[${i}].dir`),
            });
        }
        this._program.programLoc.u_viewMat4 = 
            WebglHelper.getUniformLocation(gl, pbrProgram, `u_viewMat4`);
        this._program.programLoc.u_cascadeCount =
            WebglHelper.getUniformLocation(gl, pbrProgram, `u_cascadeCount`);
        for(let i = 0; i < 16; i++){
            this._program.programLoc.u_cascadeFars.push(
                WebglHelper.getUniformLocation(gl, pbrProgram, `u_cascadeFars[${i}]`)
            );
            this._program.programLoc.u_cascadeVPs.push(
                WebglHelper.getUniformLocation(gl, pbrProgram, `u_cascadeVPs[${i}]`)
            );
        }
        this._program.programLoc.u_cascadeShadowMap = WebglHelper.getUniformLocation(gl, pbrProgram, `u_cascadeShadowMap`);
    }
    private activeTexture(
        textureLoc: WebGLUniformLocation,
        textureNum: number,
        uuidRef: string | undefined,
        defaultWebglTexture: WebglTexture,
    ){
        let webglTexture: WebglTexture | undefined;
        if(uuidRef){
            webglTexture = AssetCache.getInstance().getWebglTexture(uuidRef);
        }
        if(!webglTexture) webglTexture = defaultWebglTexture;
        const gl = this._gl;
        gl.activeTexture(gl.TEXTURE0 + textureNum);
        gl.bindTexture(gl.TEXTURE_2D, webglTexture.webglTexture);
        gl.uniform1i(textureLoc, textureNum);
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
            gl.vertexAttribPointer(1, 3, normal.type, normal.normalized, stride, position.itemSize);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(2, 2, uv.type, uv.normalized, stride, position.itemSize + normal.itemSize);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(3, 4, tangent.type, tangent.normalized, stride, position.itemSize + normal.itemSize + uv.itemSize);
            gl.enableVertexAttribArray(3);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    private renderMesh(renderNodeData: RenderNodeData, webglMesh: WebglMesh){
        const { primitive, materialAsset, transforms } = renderNodeData;
        const { mvpMat4, modelMat4, normalMat3, camPos, viewMat4 } = transforms;
        const {
            baseTextureRef, baseFactor, metallicRoughnessTextureRef, roughnessFactor, metallicFactor,
            normalTextureRef, normalScale, emissiveTextureRef, emissitveFactor, occlusionTextureRef, occlusionStrength,
            transparent, alphaCutoff,
        } = materialAsset as PbrMaterialAsset;

        // get vao
        const vao = webglMesh.getMeshVAO(this._vaoId, this.createMeshVAO);

        // set uniforms
        const gl = this._gl;
        const shaderContext = this._program;
        const {
            program, u_MvpMatrixLoc, u_ModelMatrixLoc, u_NormalMatrixLoc,
            u_baseMapLoc, u_baseFactorLoc, u_metallicRoughnessMapLoc, u_roughnessFactorLoc, u_metallicFactorLoc,
            u_normalMapLoc, u_normalScaleLoc, u_emissiveMapLoc, u_emissiveFactorLoc, u_aoMapLoc, u_aoStrengthLoc,
            u_CamWorldPosLoc, u_reflectanceLoc,
            u_hasIBL, u_irradianceMapLoc, u_prefilterMapLoc, u_brdfLUTLoc,
            u_directionalLightSizeLoc, u_pointLightSizeLoc, u_spotLightSizeLoc, programLoc,
            u_transparentModeLoc, u_alphaCutoffLoc
        } = shaderContext;
        gl.useProgram(program);
        // vertex uniforms
        gl.uniformMatrix4fv(u_MvpMatrixLoc, false, mvpMat4.values);
        gl.uniformMatrix4fv(u_ModelMatrixLoc, false, modelMat4.values);
        gl.uniformMatrix3fv(u_NormalMatrixLoc, false, normalMat3.values);
        // fragment uniforms
        const defaltWhite = DefaultWebglTexture.getInstance()._whiteWebglTexture;
        const defaltNormal = DefaultWebglTexture.getInstance()._normalWebglTexture;
        // base map
        this.activeTexture(u_baseMapLoc, 0, baseTextureRef, defaltWhite);
        gl.uniform4fv(u_baseFactorLoc, baseFactor.values);
        // mr map
        this.activeTexture(u_metallicRoughnessMapLoc, 1, metallicRoughnessTextureRef, defaltWhite);
        gl.uniform1f(u_roughnessFactorLoc, roughnessFactor);
        gl.uniform1f(u_metallicFactorLoc, metallicFactor);
        // normal map
        this.activeTexture(u_normalMapLoc, 2, normalTextureRef, defaltNormal);
        gl.uniform1f(u_normalScaleLoc, normalScale);
        // emissive map
        this.activeTexture(u_emissiveMapLoc, 3, emissiveTextureRef, defaltWhite);
        gl.uniform3fv(u_emissiveFactorLoc, emissitveFactor.values);
        // ao map
        this.activeTexture(u_aoMapLoc, 4, occlusionTextureRef, defaltWhite);
        gl.uniform1f(u_aoStrengthLoc, occlusionStrength);
        // other uniforms
        gl.uniform3fv(u_CamWorldPosLoc, camPos.values);
        gl.uniform1f(u_reflectanceLoc, 0.5);
        // ambient uniforms
        let irradianceMap: WebGLTexture | undefined = undefined;
        let prefilterMap: WebGLTexture | undefined = undefined;
        let brdfLUT: WebGLTexture | undefined = undefined;
        const uniqueSkyBox = SkyBoxInfo.getInstance().uniqueSkyBox;
        if(uniqueSkyBox && uniqueSkyBox.hdrRef){
            const hdr = AssetCache.getInstance().getHdr(uniqueSkyBox.hdrRef);
            if(hdr && hdr.irradianceMap){
                irradianceMap = hdr.irradianceMap.webglTexture;
            }
            if(hdr && hdr.prefilterMap){
                prefilterMap = hdr.prefilterMap.webglTexture;
            }
            if(hdr && hdr.brdfLUT){
                brdfLUT = hdr.brdfLUT.webglTexture;
            }
            if(!irradianceMap){
                console.warn("skybox missing irradianceMap");
                return;
            }
            if(!prefilterMap){
                console.warn("skybox missing prefilterMap");
                return;
            }
            if(!brdfLUT){
                console.warn("skybox missing brdfLUT");
                return;
            }
        }
        if(irradianceMap && prefilterMap && brdfLUT){
            gl.uniform1i(u_hasIBL, 1);
            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, irradianceMap);
            gl.uniform1i(u_irradianceMapLoc, 6);
            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, prefilterMap);
            gl.uniform1i(u_prefilterMapLoc, 7);
            gl.activeTexture(gl.TEXTURE8);
            gl.bindTexture(gl.TEXTURE_2D, brdfLUT);
            gl.uniform1i(u_brdfLUTLoc, 8);
        }
        else{
            gl.uniform1i(u_hasIBL, 0);
            gl.uniform1i(u_irradianceMapLoc, 6);
            gl.uniform1i(u_prefilterMapLoc, 7);
            gl.uniform1i(u_brdfLUTLoc, 8);
        }
        // light uniforms
        const { pointLightInfos, directionalInfos, spotLightInfos } = LightInfo.getInstance();
        gl.uniform1i(u_directionalLightSizeLoc, directionalInfos.length);
        gl.uniform1i(u_pointLightSizeLoc, pointLightInfos.length);
        gl.uniform1i(u_spotLightSizeLoc, spotLightInfos.length);
        const maxNumDirectionalShadownMap = 1;
        let nDirectionalShadownMap = 0;
        for(let i = 0; i < directionalInfos.length; i++){
            const { light, forward, cascadeShadow } = directionalInfos[i];
            gl.uniform3fv(
                programLoc.u_directionalLights[i].color,
                light.color.values
            );
            gl.uniform1f(programLoc.u_directionalLights[i].intensity, light.intensity);
            gl.uniform3fv(
                programLoc.u_directionalLights[i].dir,
                forward.values
            );
            if(
                cascadeShadow &&
                nDirectionalShadownMap < maxNumDirectionalShadownMap
            ){
                nDirectionalShadownMap++;
                gl.uniform1i(programLoc.u_directionalLights[i].hasShadow, 1);
                gl.uniform1f(programLoc.u_directionalLights[i].bias, light.shadow.bias);
                gl.uniform1f(programLoc.u_directionalLights[i].normalBias, light.shadow.normalBias);
                gl.uniform1i(programLoc.u_directionalLights[i].softShadow, light.shadow.softShadow === "hard" ? 0 : 1);

                const { cascadeFars, cascadeVPs, cascadeShadowMap } = cascadeShadow;
                const cascadeCount = cascadeFars.length;
                gl.uniformMatrix4fv(programLoc.u_viewMat4, false, viewMat4.values);
                gl.uniform1i(programLoc.u_cascadeCount, cascadeCount);
                for(let j = 0; j < cascadeCount; j++){
                    gl.uniform1f(programLoc.u_cascadeFars[j], cascadeFars[j]);
                    gl.uniformMatrix4fv(programLoc.u_cascadeVPs[j], false, cascadeVPs[j].values);
                }
                gl.activeTexture(gl.TEXTURE31);
                gl.bindTexture(gl.TEXTURE_2D_ARRAY, cascadeShadowMap);
                gl.uniform1i(programLoc.u_cascadeShadowMap, 31);
            }
            else{
                gl.uniform1i(programLoc.u_directionalLights[i].hasShadow, 0);
                gl.activeTexture(gl.TEXTURE31);
                // todo: missing emptyCascadeShadowMap
                // err: GL_INVALID_OPERATION: glDrawElements: Two textures of different types use the same sampler location.
                // gl.bindTexture(gl.TEXTURE_2D_ARRAY, emptyCascadeShadowMap);
                gl.uniform1i(programLoc.u_cascadeShadowMap, 31);
            }
        }
        for(let i = 0; i < pointLightInfos.length; i++){
            const { light, pos } = pointLightInfos[i];
            gl.uniform3fv(
                programLoc.u_pointLights[i].color,
                light.color.values
            );
            gl.uniform1f(programLoc.u_pointLights[i].intensity, light.intensity);
            gl.uniform1f(programLoc.u_pointLights[i].radius, light.radius);
            gl.uniform3fv(
                programLoc.u_pointLights[i].position,
                pos.values
            );
        }
        for(let i = 0; i < spotLightInfos.length; i++){
            const { light, pos, forward } = spotLightInfos[i];
            gl.uniform3fv(
                programLoc.u_spotLights[i].color,
                light.color.values
            );
            gl.uniform1f(programLoc.u_spotLights[i].intensity, light.intensity);
            gl.uniform1f(programLoc.u_spotLights[i].radius, light.radius);
            gl.uniform1f(programLoc.u_spotLights[i].innerAngle, light.innerAngle * Math.PI / 180);
            gl.uniform1f(programLoc.u_spotLights[i].outerAngle, light.outerAngle * Math.PI / 180);
            gl.uniform3fv(
                programLoc.u_spotLights[i].position,
                pos.values
            );
            gl.uniform3fv(
                programLoc.u_spotLights[i].dir,
                forward.values
            );
        }
        // alpha uniforms
        if(transparent === "opaque") gl.uniform1i(u_transparentModeLoc, 0);
        else if(transparent === "mask") gl.uniform1i(u_transparentModeLoc, 1);
        else gl.uniform1i(u_transparentModeLoc, 2);
        gl.uniform1f(u_alphaCutoffLoc, alphaCutoff);

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