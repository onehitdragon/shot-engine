import { ComponentHelper, Mat4, Vec3, type DirectionalLight, type Light, type PointLight, type SpotLight } from "@shot-engine/types";
import { getSceneWebglContext } from "../resource-manager-helper/CanvasHelper";

import type { NodeState } from "../../../../global-state/slices/go-tree-slice";
import { AssetCache } from "./asset-cache";
import { NodesInfo } from "../../../../global-state/thunks/go-tree-thunks";
import { GizmoOrbitCameraInfo } from "../../../../global-state/thunks/gizmo-orbit-camera-thunk";

export class LightInfo{
    private static _instance: LightInfo;
    static getInstance(){
        if(!this._instance) this._instance = new LightInfo();
        return this._instance;
    }
    private _directionalInfos: {
        light: DirectionalLight, pos: Vec3, forward: Vec3
        cascadeShadow?: {
            cascadeFars: number[],
            cascadeVPs: Mat4[],
            cascadeShadowMap: WebGLTexture,
        }
    }[] = [];
    private _pointLightInfos: { light: PointLight, pos: Vec3, forward: Vec3 }[] = [];
    private _spotLightInfos: { light: SpotLight, pos: Vec3, forward: Vec3 }[] = [];
    private _directinalShadowWebgl: {
        texture?: WebGLTexture,
        fbo?: WebGLFramebuffer
    };
    get directionalInfos(){
        return this._directionalInfos;
    }
    get pointLightInfos(){
        return this._pointLightInfos;
    }
    get spotLightInfos(){
        return this._spotLightInfos;
    }
    private constructor(){
        this._directinalShadowWebgl = {};
    }
    public addLight(light: Light, pos: Vec3, forward: Vec3, nodes: NodeState[]){
        if(light.lightType === "DirectionalLight"){
            const cascadeShadow = this.buildDirectionalLightShadowMap(light, forward, nodes);
            this._directionalInfos.push({
                light, pos, forward,
                cascadeShadow
            });
        }
        if(light.lightType === "PointLight"){
            this._pointLightInfos.push({ light, pos, forward });
        }
        if(light.lightType === "SpotLight"){
            this._spotLightInfos.push({ light, pos, forward });
        }
    }
    private cascadeSplit(near: number, far: number, nCas: number, lamda: number){
        const uniform = (i: number) => near + (far - near) * (i / nCas);
        const log = (i: number) => near * Math.pow(far / near, i / nCas);
        const cascades: { near: number, far: number }[] = [];
        let casNear = near;
        for(let i = 1; i <= nCas; i++){
            const casFar = lamda * log(i) + (1 - lamda) * uniform(i);
            cascades.push({ near: casNear, far: casFar });
            casNear = casFar;
        }
        return cascades;
    }
    private cascadeVP(
        cascade: { near: number, far: number },
        camFov: number, camAspect: number, camView: Mat4,
        shadowMapSize: number, lightDir: Vec3, zMul = 1
    ){
        const cascadeProj = Mat4.Perspective(camFov, camAspect, cascade.near, cascade.far);
        const invertVP = Mat4.Invert(Mat4.Multiply(cascadeProj, camView));

        const ndcs = [
            Vec3.FromArray([-1,-1,-1]),
            Vec3.FromArray([ 1,-1,-1]),
            Vec3.FromArray([-1, 1,-1]),
            Vec3.FromArray([ 1, 1,-1]),
            Vec3.FromArray([-1,-1, 1]),
            Vec3.FromArray([ 1,-1, 1]),
            Vec3.FromArray([-1, 1, 1]),
            Vec3.FromArray([1, 1, 1])
        ];
        const corners: Vec3[] = [];
        let center = Vec3.Zero();
        for(const ndc of ndcs){
            const corner = Vec3.TransformMat4(ndc, invertVP);
            corners.push(corner);
            center = Vec3.Add(center, corner);
        }
        center = Vec3.Scale(center, 1 / 8);

        let radius = 0;
        for (const pt of corners) {
            const dist = Vec3.Distance(pt, center);
            radius = Math.max(radius, dist);
        }
        radius = Math.ceil(radius);

        let up = Vec3.Up();
        if(Math.abs(Vec3.Dot(lightDir, up)) > 0.99) up = Vec3.Forward();

        const texelPerWorld = shadowMapSize / (radius * 2);
        const scaleMat4 = Mat4.FromScaling(Vec3.FromArray([texelPerWorld,texelPerWorld,texelPerWorld]));
        const lookAtBase = Mat4.LookAt(Vec3.Zero(), Vec3.Scale(lightDir, -1), Vec3.Up());
        const lookAt = Mat4.Multiply(scaleMat4, lookAtBase);
        const lookInv = Mat4.Invert(lookAt);
        center = Vec3.TransformMat4(center, lookAt);
        center.x = Math.floor(center.x);
        center.y = Math.floor(center.y);
        center = Vec3.TransformMat4(center, lookInv);

        let lightPos = Vec3.Sub(center, Vec3.Scale(lightDir, 0.001));
        let lightViewMat4 = Mat4.LookAt(lightPos, center, up);

        const lightClipMat4 = Mat4.Ortho(-radius, radius, -radius, radius, -radius * zMul, radius);
        const lightVPMat4 = Mat4.Multiply(lightClipMat4, lightViewMat4);
        return lightVPMat4;
    }
    private cascadeVPs(lightDir: Vec3, shadowMapSize: number, nCas: number, lamda: number){
        const { near, far, fov, aspect } = GizmoOrbitCameraInfo.getInstance().camera;
        const camView = GizmoOrbitCameraInfo.getInstance().viewMat4;
        const cascades = this.cascadeSplit(near, far, nCas, lamda);
        const cascadeVPs = cascades.map(
            cas => this.cascadeVP(cas, fov, aspect, camView, shadowMapSize, lightDir, 1)
        );
        return [cascades.map(c => c.far), cascadeVPs] as const;
    }

    private buildDirectionalLightShadowMap(
        light: DirectionalLight, forward: Vec3, nodes: NodeState[]
    ){
        const { enable, mapSize } = light.shadow;
        if(!enable) return;

        const gl = getSceneWebglContext();
        const [,,sceneWidth, sceneHeight] = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];
        // config
        const nCas = 4;
        const lamda = 0.8;
        const [cascadeFars, cascadeVPs] = this.cascadeVPs(forward, mapSize, nCas, lamda);
        // create texture
        let depthMapTexture = this._directinalShadowWebgl.texture;
        if(!depthMapTexture){
            depthMapTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, depthMapTexture);
            gl.texImage3D(
                gl.TEXTURE_2D_ARRAY, 0, gl.DEPTH_COMPONENT32F, mapSize, mapSize,
                nCas, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null
            );
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
            this._directinalShadowWebgl.texture = depthMapTexture;
        }
        // create fbo
        let depthMapFBO = this._directinalShadowWebgl.fbo;
        if(!depthMapFBO){
            depthMapFBO = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer(gl.NONE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this._directinalShadowWebgl.fbo = depthMapFBO;
        }
        // program
        gl.viewport(0, 0, mapSize, mapSize);
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
        for(let i = 0; i < nCas; i++){
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, depthMapTexture, 0, i);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            this.renderNodes(cascadeVPs[i], nodes);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, sceneWidth, sceneHeight);

        // free
        return {
            cascadeFars, cascadeVPs, cascadeShadowMap: depthMapTexture
        }
    }
    private renderNodes(lightVPMat4: Mat4, nodes: NodeState[]){
        for(const node of nodes){
            const meshComponent = ComponentHelper.FindComponentByType(node.components, "Mesh");
            if(!meshComponent) continue;
            const webglMeshs = AssetCache.getInstance().getWebglMeshes(meshComponent.meshRef);
            if(!webglMeshs) continue;
            const modelMat4 = NodesInfo.getInstance().nodeInfos.get(node.id)?.worldMatrix;
            if(!modelMat4) continue;
            for(const webglMesh of webglMeshs){
                webglMesh.renderWithShadowMapShader(lightVPMat4, modelMat4);
            }
        }
    }
    public reset(){
        this._directionalInfos = [];
        this._pointLightInfos = [];
        this._spotLightInfos = [];
    }
}