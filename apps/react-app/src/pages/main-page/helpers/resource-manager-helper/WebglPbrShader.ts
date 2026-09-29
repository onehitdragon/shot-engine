import { WebglHelper } from "./WebglHelper";
import pbrShadingVShaderSource from "../shaders/pbr-shader/vshader.glsl?raw";
import pbrShadingFShaderSource from "../shaders/pbr-shader/fshader.glsl?raw";
import type { WebglMeshVBOs } from "./WebglMeshVBOs";
import { Vec3, type Mat3, type Mat4, type PbrShading } from "@shot-engine/types";
import { LightInfo } from "../asset-cache/LightInfo";
import { AssetCache } from "../asset-cache/asset-cache";
import { ColorCache } from "../asset-cache/color-cache";
import { SkyBoxInfo } from "../asset-cache/SkyBoxInfo";

export class WebglPbrShader{
    private static _instance: WebglPbrShader;
    static getInstance(gl: WebGL2RenderingContext){
        if(!this._instance) this._instance = new WebglPbrShader(gl);
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
    private _a_TangentLoc: number;
    private _u_CamWorldPosLoc: WebGLUniformLocation;

    private _u_baseColorSamplerLoc: WebGLUniformLocation;
    private _u_metallicLoc: WebGLUniformLocation;
    private _u_hasMetallicMapLoc: WebGLUniformLocation;
    private _u_metallicMapLoc: WebGLUniformLocation;
    private _u_perceptualRoughnessLoc: WebGLUniformLocation;
    private _u_hasRoughnessMapLoc: WebGLUniformLocation;
    private _u_roughnessMapLoc: WebGLUniformLocation;
    private _u_reflectanceLoc: WebGLUniformLocation;
    private _u_emissiveLoc: WebGLUniformLocation;
    private _u_emissiveIntensityLoc: WebGLUniformLocation;
    private _u_hasEmissiveMapLoc: WebGLUniformLocation;
    private _u_emissiveMapLoc: WebGLUniformLocation;

    private _u_hasNormalMapLoc: WebGLUniformLocation;
    private _u_normalMapLoc: WebGLUniformLocation;
    private _u_hasAoMapLoc: WebGLUniformLocation;
    private _u_aoMapLoc: WebGLUniformLocation;

    private _u_hasIBL: WebGLUniformLocation;
    private _u_irradianceMapLoc: WebGLUniformLocation;
    private _u_prefilterMapLoc: WebGLUniformLocation;
    private _u_brdfLUTLoc: WebGLUniformLocation;

    private _u_directionalLightSizeLoc: WebGLUniformLocation;
    private _u_pointLightSizeLoc: WebGLUniformLocation;
    private _u_spotLightSizeLoc: WebGLUniformLocation;
    private readonly NUM_LIGHTS = 32;
    private _programLoc: {
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
        u_cascadeShadowMap: WebGLUniformLocation

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
    }
    private constructor(gl: WebGL2RenderingContext){
        this._gl = gl;
        this._program = WebglHelper.createProgram(
            gl,
            [
                { type: gl.VERTEX_SHADER, source: pbrShadingVShaderSource },
                { type: gl.FRAGMENT_SHADER, source: pbrShadingFShaderSource },
            ]
        );
        const program = this._program;
        this._u_MvpMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_MvpMatrix");
        this._u_ModelMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_ModelMatrix");
        this._u_NormalMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_NormalMatrix");
        this._a_PositionLoc = WebglHelper.getAttrLocation(gl, program, "a_Position");
        this._a_NormalLoc = WebglHelper.getAttrLocation(gl, program, "a_Normal");
        this._a_TextCoordLoc = WebglHelper.getAttrLocation(gl, program, "a_TextCoord");
        this._a_TangentLoc = WebglHelper.getAttrLocation(gl, program, "a_Tangent");

        this._u_CamWorldPosLoc = WebglHelper.getUniformLocation(gl, program, "u_CamWorldPos");

        this._u_baseColorSamplerLoc = WebglHelper.getUniformLocation(gl, program, "u_baseColorSampler");
        this._u_metallicLoc = WebglHelper.getUniformLocation(gl, program, "u_metallic");
        this._u_hasMetallicMapLoc = WebglHelper.getUniformLocation(gl, program, "u_hasMetallicMap");
        this._u_metallicMapLoc = WebglHelper.getUniformLocation(gl, program, "u_metallicMap");
        this._u_perceptualRoughnessLoc = WebglHelper.getUniformLocation(gl, program, "u_perceptualRoughness");
        this._u_hasRoughnessMapLoc = WebglHelper.getUniformLocation(gl, program, "u_hasRoughnessMap");
        this._u_roughnessMapLoc = WebglHelper.getUniformLocation(gl, program, "u_roughnessMap");
        this._u_reflectanceLoc = WebglHelper.getUniformLocation(gl, program, "u_reflectance");
        this._u_emissiveLoc = WebglHelper.getUniformLocation(gl, program, "u_emissive");
        this._u_emissiveIntensityLoc = WebglHelper.getUniformLocation(gl, program, "u_emissiveIntensity");
        this._u_hasEmissiveMapLoc = WebglHelper.getUniformLocation(gl, program, "u_hasEmissiveMap");
        this._u_emissiveMapLoc = WebglHelper.getUniformLocation(gl, program, "u_emissiveMap");

        this._u_hasNormalMapLoc = WebglHelper.getUniformLocation(gl, program, "u_hasNormalMap");
        this._u_normalMapLoc = WebglHelper.getUniformLocation(gl, program, "u_normalMap");
        this._u_hasAoMapLoc = WebglHelper.getUniformLocation(gl, program, "u_hasAoMap");
        this._u_aoMapLoc = WebglHelper.getUniformLocation(gl, program, "u_aoMap");

        this._u_hasIBL = WebglHelper.getUniformLocation(gl, program, "u_hasIBL");
        this._u_irradianceMapLoc = WebglHelper.getUniformLocation(gl, program, "u_irradianceMap");
        this._u_prefilterMapLoc = WebglHelper.getUniformLocation(gl, program, "u_prefilterMap");
        this._u_brdfLUTLoc = WebglHelper.getUniformLocation(gl, program, "u_brdfLUT");

        this._u_directionalLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_directionalLightSize");
        this._u_pointLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_pointLightSize");
        this._u_spotLightSizeLoc = WebglHelper.getUniformLocation(gl, program, "u_spotLightSize");
        this._programLoc = {
            u_directionalLights: [],
            u_viewMat4: -1,
            u_cascadeCount: -1,
            u_cascadeFars: [],
            u_cascadeVPs: [],
            u_cascadeShadowMap: -1,

            u_pointLights: [],
            u_spotLights: []
        };
        for(let i = 0; i < this.NUM_LIGHTS; i++){
            this._programLoc.u_directionalLights.push({
                color: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].intensity`),
                dir: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].dir`),
                hasShadow: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].hasShadow`),
                bias: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].bias`),
                normalBias: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].normalBias`),
                softShadow: WebglHelper.getUniformLocation(gl, program, `u_directionalLights[${i}].softShadow`),
            });
            this._programLoc.u_pointLights.push({
                color: WebglHelper.getUniformLocation(gl, program, `u_pointLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, program, `u_pointLights[${i}].intensity`),
                radius: WebglHelper.getUniformLocation(gl, program, `u_pointLights[${i}].radius`),
                position: WebglHelper.getUniformLocation(gl, program, `u_pointLights[${i}].position`),
            });
            this._programLoc.u_spotLights.push({
                color: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].color`),
                intensity: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].intensity`),
                radius: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].radius`),
                innerAngle: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].innerAngle`),
                outerAngle: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].outerAngle`),
                position: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].position`),
                dir: WebglHelper.getUniformLocation(gl, program, `u_spotLights[${i}].dir`),
            });
        }
        this._programLoc.u_viewMat4 = 
            WebglHelper.getUniformLocation(gl, program, `u_viewMat4`);
        this._programLoc.u_cascadeCount =
            WebglHelper.getUniformLocation(gl, program, `u_cascadeCount`);
        for(let i = 0; i < 16; i++){
            this._programLoc.u_cascadeFars.push(
                WebglHelper.getUniformLocation(gl, program, `u_cascadeFars[${i}]`)
            );
            this._programLoc.u_cascadeVPs.push(
                WebglHelper.getUniformLocation(gl, program, `u_cascadeVPs[${i}]`)
            );
        }
        this._programLoc.u_cascadeShadowMap =
            WebglHelper.getUniformLocation(gl, program, `u_cascadeShadowMap`);
    }
    createMeshVAOs(meshVBOs: WebglMeshVBOs){
        const gl = this._gl;
        const vbos = meshVBOs;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
            vbos.bindVertexVBO();
            const stride = (3 + 3 + 2 + 3) * 4; // (3 verter, 3 normal, 2 uv, 3 tangent) * floatSize = 4
            gl.vertexAttribPointer(this._a_PositionLoc, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(this._a_PositionLoc);
            gl.vertexAttribPointer(this._a_NormalLoc, 3, gl.FLOAT, false, stride, 3 * 4);
            gl.enableVertexAttribArray(this._a_NormalLoc);
            gl.vertexAttribPointer(this._a_TextCoordLoc, 2, gl.FLOAT, false, stride, (3 + 3) * 4);
            gl.enableVertexAttribArray(this._a_TextCoordLoc);
            gl.vertexAttribPointer(this._a_TangentLoc, 3, gl.FLOAT, false, stride, (3 + 3 + 2) * 4);
            gl.enableVertexAttribArray(this._a_TangentLoc);
            vbos.bindIndexVBO();
        gl.bindVertexArray(null);
        return vao;
    }
    renderMesh(
        meshVBOs: WebglMeshVBOs,
        vao: WebGLVertexArrayObject,
        mvpMat4: Mat4,
        modelMat4: Mat4,
        viewMat4: Mat4,
        normalMat3: Mat3,
        camPos: Vec3,
        shadingComponent: PbrShading
    ){
        const gl = this._gl;
        const vbos = meshVBOs;
        const { pointLightInfos, directionalInfos, spotLightInfos } = LightInfo.getInstance();
        const { diffuse, metallic, roughness, reflectance, emissive, normal, ao } = shadingComponent;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._u_MvpMatrixLoc, false, mvpMat4.values);
        gl.uniformMatrix4fv(this._u_ModelMatrixLoc, false, modelMat4.values);
        gl.uniformMatrix3fv(this._u_NormalMatrixLoc, false, normalMat3.values);
        gl.uniform3fv(this._u_CamWorldPosLoc, [camPos.x, camPos.y, camPos.z]);
        gl.uniform1f(this._u_reflectanceLoc, reflectance);

        // lights
        gl.uniform1i(this._u_directionalLightSizeLoc, directionalInfos.length);
        gl.uniform1i(this._u_pointLightSizeLoc, pointLightInfos.length);
        gl.uniform1i(this._u_spotLightSizeLoc, spotLightInfos.length);
        const maxNumDirectionalShadownMap = 1;
        let nDirectionalShadownMap = 0;
        for(let i = 0; i < directionalInfos.length; i++){
            const { light, forward, cascadeShadow } = directionalInfos[i];
            gl.uniform3fv(
                this._programLoc.u_directionalLights[i].color,
                [light.color.x, light.color.y, light.color.z]
            );
            gl.uniform1f(this._programLoc.u_directionalLights[i].intensity, light.intensity);
            gl.uniform3fv(
                this._programLoc.u_directionalLights[i].dir,
                [forward.x, forward.y, forward.z]
            );
            if(
                cascadeShadow &&
                nDirectionalShadownMap < maxNumDirectionalShadownMap
            ){
                nDirectionalShadownMap++;
                gl.uniform1i(this._programLoc.u_directionalLights[i].hasShadow, 1);
                gl.uniform1f(this._programLoc.u_directionalLights[i].bias, light.shadow.bias);
                gl.uniform1f(this._programLoc.u_directionalLights[i].normalBias, light.shadow.normalBias);
                gl.uniform1i(this._programLoc.u_directionalLights[i].softShadow, light.shadow.softShadow === "hard" ? 0 : 1);

                const { cascadeFars, cascadeVPs, cascadeShadowMap } = cascadeShadow;
                const cascadeCount = cascadeFars.length;
                gl.uniformMatrix4fv(this._programLoc.u_viewMat4, false, viewMat4.values);
                gl.uniform1i(this._programLoc.u_cascadeCount, cascadeCount);
                for(let j = 0; j < cascadeCount; j++){
                    gl.uniform1f(this._programLoc.u_cascadeFars[j], cascadeFars[j]);
                    gl.uniformMatrix4fv(this._programLoc.u_cascadeVPs[j], false, cascadeVPs[j].values);
                }
                gl.activeTexture(gl.TEXTURE31);
                gl.bindTexture(gl.TEXTURE_2D_ARRAY, cascadeShadowMap);
                gl.uniform1i(this._programLoc.u_cascadeShadowMap, 31);
            }
            else{
                gl.uniform1i(this._programLoc.u_directionalLights[i].hasShadow, 0);
                gl.activeTexture(gl.TEXTURE31);
                gl.uniform1i(this._programLoc.u_cascadeShadowMap, 31);
            }
        }
        for(let i = 0; i < pointLightInfos.length; i++){
            const { light, pos } = pointLightInfos[i];
            gl.uniform3fv(
                this._programLoc.u_pointLights[i].color,
                [light.color.x, light.color.y, light.color.z]
            );
            gl.uniform1f(this._programLoc.u_pointLights[i].intensity, light.intensity);
            gl.uniform1f(this._programLoc.u_pointLights[i].radius, light.radius);
            gl.uniform3fv(
                this._programLoc.u_pointLights[i].position,
                [pos.x, pos.y, pos.z]
            );
        }
        for(let i = 0; i < spotLightInfos.length; i++){
            const { light, pos, forward } = spotLightInfos[i];
            gl.uniform3fv(
                this._programLoc.u_spotLights[i].color,
                [light.color.x, light.color.y, light.color.z]
            );
            gl.uniform1f(this._programLoc.u_spotLights[i].intensity, light.intensity);
            gl.uniform1f(this._programLoc.u_spotLights[i].radius, light.radius);
            gl.uniform1f(this._programLoc.u_spotLights[i].innerAngle, light.innerAngle * Math.PI / 180);
            gl.uniform1f(this._programLoc.u_spotLights[i].outerAngle, light.outerAngle * Math.PI / 180);
            gl.uniform3fv(
                this._programLoc.u_spotLights[i].position,
                [pos.x, pos.y, pos.z]
            );
            gl.uniform3fv(
                this._programLoc.u_spotLights[i].dir,
                [forward.x, forward.y, forward.z]
            );
        }

        // diffuse
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
        gl.uniform1i(this._u_baseColorSamplerLoc, 0);

        // normal
        if(normal.type === "none"){
            gl.uniform1i(this._u_hasNormalMapLoc, 0);
        }
        else{
            gl.uniform1i(this._u_hasNormalMapLoc, 1);
            const normalWebglTexture = AssetCache.getInstance().getWebglTexture(normal.imageRef);
            if(!normalWebglTexture){
                console.warn("cant find normal texture");
                return;
            }
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, normalWebglTexture.webglTexture);
            gl.uniform1i(this._u_normalMapLoc, 1);
        }

        // metallic
        if(metallic.type === "value"){
            gl.uniform1i(this._u_hasMetallicMapLoc, 0);
            gl.uniform1f(this._u_metallicLoc, metallic.value);
        }
        else{
            gl.uniform1i(this._u_hasMetallicMapLoc, 1);
            const metallicWebglTexture = AssetCache.getInstance().getWebglTexture(metallic.imageRef);
            if(!metallicWebglTexture){
                console.warn("cant find metallic texture");
                return;
            }
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, metallicWebglTexture.webglTexture);
            gl.uniform1i(this._u_metallicMapLoc, 2);
        }

        // roughness
        if(roughness.type === "value"){
            gl.uniform1i(this._u_hasRoughnessMapLoc, 0);
            gl.uniform1f(this._u_perceptualRoughnessLoc, roughness.value);
        }
        else{
            gl.uniform1i(this._u_hasRoughnessMapLoc, 1);
            const roughnessWebglTexture = AssetCache.getInstance().getWebglTexture(roughness.imageRef);
            if(!roughnessWebglTexture){
                console.warn("cant find roughness texture");
                return;
            }
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, roughnessWebglTexture.webglTexture);
            gl.uniform1i(this._u_roughnessMapLoc, 3);
        }

        // emissive
        gl.uniform1f(this._u_emissiveIntensityLoc, emissive.intensity);
        if(emissive.color.type === "color"){
            gl.uniform1i(this._u_hasEmissiveMapLoc, 0);
            gl.uniform3fv(this._u_emissiveLoc, Vec3.ToArray(emissive.color.color));
        }
        else{
            gl.uniform1i(this._u_hasEmissiveMapLoc, 1);
            const emissiveWebglTexture = AssetCache.getInstance().getWebglTexture(emissive.color.imageRef);
            if(!emissiveWebglTexture){
                console.warn("cant find roughness texture");
                return;
            }
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, emissiveWebglTexture.webglTexture);
            gl.uniform1i(this._u_emissiveMapLoc, 4);
        }

        // ao
        if(ao.type === "none"){
            gl.uniform1i(this._u_hasAoMapLoc, 0);
        }
        else{
            gl.uniform1i(this._u_hasAoMapLoc, 1);
            const aoWebglTexture = AssetCache.getInstance().getWebglTexture(ao.imageRef);
            if(!aoWebglTexture){
                console.warn("cant find normal texture");
                return;
            }
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, aoWebglTexture.webglTexture);
            gl.uniform1i(this._u_aoMapLoc, 5);
        }

        // ibl
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
            gl.uniform1i(this._u_hasIBL, 1);
            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, irradianceMap);
            gl.uniform1i(this._u_irradianceMapLoc, 6);
            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, prefilterMap);
            gl.uniform1i(this._u_prefilterMapLoc, 7);
            gl.activeTexture(gl.TEXTURE8);
            gl.bindTexture(gl.TEXTURE_2D, brdfLUT);
            gl.uniform1i(this._u_brdfLUTLoc, 8);
        }
        else{
            gl.uniform1i(this._u_hasIBL, 0);
            gl.uniform1i(this._u_irradianceMapLoc, 6);
            gl.uniform1i(this._u_prefilterMapLoc, 7);
            gl.uniform1i(this._u_brdfLUTLoc, 8);
        }

        gl.bindVertexArray(vao);
            gl.drawElements(vbos.drawMode, vbos.indexCount, vbos.indexType, 0);
        gl.bindVertexArray(null);
    }
}