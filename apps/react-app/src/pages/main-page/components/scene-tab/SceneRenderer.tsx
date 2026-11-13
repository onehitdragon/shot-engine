import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { WebglRenderer } from "../../helpers/resource-manager-helper/WebglRenderer";
import { selectNodeRecord, selectNodes, type NodeState } from "../../../../global-state/slices/go-tree-slice";
import { ComponentHelper, type Component, type MaterialAsset, type MeshAsset, type MeshRenderer, type SkinnedMeshRenderer } from "@shot-engine/types";
import { AssetCache } from "../../helpers/asset-cache/asset-cache";
import { LightInfo } from "../../helpers/asset-cache/LightInfo";
import { SkyBoxInfo } from "../../helpers/asset-cache/SkyBoxInfo";
import { NodesInfo } from "../../../../global-state/thunks/go-tree-thunks";
import { selectGizmoNodes } from "../../../../global-state/slices/gizmo-go-tree-slice";
import { GizmoOrbitCameraInfo } from "../../../../global-state/thunks/gizmo-orbit-camera-thunk";
import { GizmoControl } from "./GizmoControl";
import { Mat3, Mat4, Vec3 } from "@shot-engine/math";
import { WebglMesh } from "../../helpers/resource-manager-helper/WebglMesh";

export function SceneRenderer(){
    const nodes = useAppSelector(state => selectNodes(state));
    const nodeRecord = useAppSelector(selectNodeRecord);
    const nodeFocusedId = useAppSelector(state => state.goTree.focusedId);

    const gizmoNodes = useAppSelector(state => selectGizmoNodes(state));

    const camera = useAppSelector(state => state.gizmoOrbitCamera.camera);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [webglRenderer, setWebglRenderer] = useState<WebglRenderer | null>(null);
    const [prepareAssetCount, setPrepareAssetCount] = useState(0);
    const assetChanged = useAppSelector(state => state.assetCache.assetChanged);

    useEffect(() => {
        const webgl2 = getSceneWebglContext();
        setWebglRenderer(WebglRenderer.getInstance(webgl2));
        return () => {}
    }, []);

    useEffect(() => {
        const controller1 = new AbortController();
        const controller2 = new AbortController();
        const handler = async () => {
            const signal1 = controller1.signal;
            const signal2 = controller2.signal;

            const { componentArrs } = await prepareAsset(nodes, signal1);
            if(signal1.aborted) return;
            await prepareAsset(gizmoNodes, signal2);
            if(signal2.aborted) return;
            
            AssetCache.getInstance().deleteUnused();

            prepareSkyBox(componentArrs);
            setPrepareAssetCount(state => state + 1);
        }
        handler();
        return () => {
            controller1.abort();
            controller2.abort();
        }
    }, [nodes, gizmoNodes, assetChanged]);

    useEffect(() => {
        prepareLight(nodes);
    }, [camera, nodes, gizmoNodes]);

    useEffect(() => {
        if(!webglRenderer || !camera || nodes.length === 0) return;

        webglRenderer.clear();

        GlobalSceneNodeRenderer.getInstance().reset();
        const renderer = new SceneNodeRenderer(webglRenderer);
        renderer.renderNodes(nodes);

        webglRenderer.renderSkyBox(
            GizmoOrbitCameraInfo.getInstance().viewMat4,
            GizmoOrbitCameraInfo.getInstance().clipMat4,
        );

        webglRenderer.renderGrid(GizmoOrbitCameraInfo.getInstance().vpMat4);

        webglRenderer.renderAxis(GizmoOrbitCameraInfo.getInstance().vpMat4);

        renderer.renderNodes(gizmoNodes);
    },[
        camera, nodes, nodeRecord, gizmoNodes, webglRenderer, prepareAssetCount, nodeFocusedId
    ]);

    return (
        <div className="flex-1 flex relative">
            <canvas ref={canvasRef} id="scene-canvas" className="w-full h-full">
                Dont supports "canvas"
            </canvas>
            <canvas id="layout-canvas" className="size-0">
                Dont supports "canvas"
            </canvas>
            <GizmoControl />
        </div>
    );
}
export type RenderNodeData = {
    node: NodeState,
    rendererComponent: MeshRenderer | SkinnedMeshRenderer,
    jointMatrices: Float32Array,
    meshAsset: MeshAsset,
    primitive: MeshAsset["primitives"][0],
    materialAsset: MaterialAsset,
    distanceToCam: number,
    transforms: {
        modelMat4: Mat4,
        mvpMat4: Mat4,
        normalMat3: Mat3,
        viewMat4: Mat4,
        camPos: Vec3,
        vpMat4: Mat4
    },
    gpuResource: {
        webglMesh: WebglMesh
    }
}
export class SceneNodeRenderer{
    private _webglRenderer: WebglRenderer;
    private _opaqueNodes: RenderNodeData[];
    private _transparentNodes: RenderNodeData[];
    constructor(webglRenderer: WebglRenderer){
        this._webglRenderer = webglRenderer;
        this._opaqueNodes = [];
        this._transparentNodes = [];
    }
    private pepareRenderNodes(nodes: NodeState[]){
        this._opaqueNodes = [];
        this._transparentNodes = [];
        const camPos = GizmoOrbitCameraInfo.getInstance().worldPos;
        for(const node of nodes){
            // get renderer component
            let rendererComponent: MeshRenderer | SkinnedMeshRenderer | undefined
                = ComponentHelper.FindComponentByType(node.components, "MeshRenderer");
            if(!rendererComponent){
                rendererComponent = ComponentHelper.FindComponentByType(node.components, "SkinnedMeshRenderer");
            }
            if(!rendererComponent) continue;

            // get mesh + materials asset
            const { meshRef, materialRefs } = rendererComponent;
            if(!meshRef) continue;
            const meshAsset = AssetCache.getInstance().getMeshAssetCache(meshRef);
            if(!meshAsset) continue;
            const webglMeshes = AssetCache.getInstance().getWebglMeshes(meshRef);
            if(!webglMeshes) continue;
            const materialAssets: MaterialAsset[] = [];
            for(const materialRef of materialRefs){
                if(!materialRef) continue;
                const materialAsset = AssetCache.getInstance().getMaterialAssetCache(materialRef);
                if(!materialAsset) continue;
                materialAssets.push(materialAsset);
            }

            // parepe transform data
            const modelMat4 = NodesInfo.getInstance().nodeInfos.get(node.id)?.worldMatrix;
            if(!modelMat4) continue;
            const mvpMat4 = this.createMVPMatrix(modelMat4);
            const viewMat4 = GizmoOrbitCameraInfo.getInstance().viewMat4;
            const normalMat3 = this.createNormalMatrix(modelMat4);
            const vpMat4 = GizmoOrbitCameraInfo.getInstance().vpMat4;

            // create joint matrices
            let jointMatrices = new Float32Array();
            if(rendererComponent.type === "SkinnedMeshRenderer"){
                const { jointRefs } = rendererComponent;
                jointMatrices = new Float32Array(jointRefs.length * 16);
                let offset = 0;
                const jointMat4 = new Mat4();
                for(const jointRef of jointRefs){
                    if(!jointRef) Mat4.Identity(jointMat4);
                    else{
                        const worldJoint = NodesInfo.getInstance().nodeInfos.get(jointRef)?.worldMatrix;
                        if(!worldJoint) Mat4.Identity(jointMat4);
                        else Mat4.Copy(jointMat4, worldJoint);
                    }
                    jointMatrices.set(jointMat4.values, offset);
                    offset += 16;
                }
            }

            // get distance to cam
            const nodeWordPos = NodesInfo.getInstance().getWorldPos(node.id);
            if(!nodeWordPos) continue;
            const distanceToCam = Vec3.SquaredDistance(camPos, nodeWordPos);

            // create RenderNodeData
            const { primitives } = meshAsset;
            for(
                let i = 0;
                i < primitives.length && i < materialAssets.length && i < webglMeshes.length;
                i++
            ){
                const primitive = primitives[i];
                const materialAsset = materialAssets[i];
                const webglMesh = webglMeshes[i];
                const renderNodeData: RenderNodeData = {
                    node,
                    rendererComponent,
                    jointMatrices,
                    meshAsset,
                    primitive,
                    materialAsset,
                    distanceToCam,
                    transforms: {
                        modelMat4,
                        mvpMat4,
                        normalMat3,
                        viewMat4,
                        camPos,
                        vpMat4
                    },
                    gpuResource: {
                        webglMesh
                    }
                }
                if(materialAsset.transparent === "blend") this._transparentNodes.push(renderNodeData);
                else this._opaqueNodes.push(renderNodeData);
            }
        }
        this._opaqueNodes.sort((a, b) => a.distanceToCam - b.distanceToCam);
        this._transparentNodes.sort((a, b) => b.distanceToCam - a.distanceToCam);
    }
    renderNodes(nodes: NodeState[]){
        this.pepareRenderNodes(nodes);
        for(const renderNodeData of this._opaqueNodes){
            this.renderGo(renderNodeData);
        }
        for(const renderNodeData of this._transparentNodes){
            this.renderGo(renderNodeData);
        }
    }
    renderGo(renderNodeData: RenderNodeData){
        this._webglRenderer.render(renderNodeData);

        const {node, meshAsset} = renderNodeData;
        GlobalSceneNodeRenderer.getInstance().nodeRenderInfos.set(node.id, {
            meshAsset
        });
    }
    createMVPMatrix(modelMat4: Mat4){
        return Mat4.Multiply(new Mat4(), GizmoOrbitCameraInfo.getInstance().vpMat4, modelMat4); // P * V * M
    }
    createNormalMatrix(modelMat4: Mat4){
        return Mat3.NormalFromMat4(new Mat3(), modelMat4);
    }
}
export class GlobalSceneNodeRenderer{
    private static _instance: GlobalSceneNodeRenderer;
    public nodeRenderInfos: Map<string, {
        meshAsset?: MeshAsset
    }>;
    static getInstance(){
        if(!this._instance) this._instance = new GlobalSceneNodeRenderer();
        return this._instance;
    }
    private constructor(){
        this.nodeRenderInfos = new Map();
    }
    public reset(){
        this.nodeRenderInfos = new Map();
    }
}
async function prepareAsset(nodes: NodeState[], signal: AbortSignal){
    const componentArrs: Component[][] = [];
    for(const node of nodes){
        if(signal.aborted) break;
        componentArrs.push(node.components);
    }
    for(const componentArr of componentArrs){
        for(const component of componentArr){
            if(signal.aborted) break;
            if(component.type === "MeshRenderer" || component.type === "SkinnedMeshRenderer"){
                if(component.meshRef){
                    await AssetCache.getInstance().createAssetCache(component.meshRef, "mesh");
                }
                for(const materialRef of component.materialRefs){
                    if(!materialRef) continue;
                    const cacheItem = await AssetCache.getInstance().createAssetCache(materialRef, "material");
                    if(!cacheItem) continue;
                    const materialAsset = cacheItem.asset as MaterialAsset;
                    if(materialAsset.matType === "pbr"){
                        const {
                            baseTextureRef, metallicRoughnessTextureRef, normalTextureRef,
                            emissiveTextureRef, occlusionTextureRef
                        } = materialAsset;
                        if(baseTextureRef){
                            await AssetCache.getInstance().createAssetCache(baseTextureRef, "image");
                        }
                        if(metallicRoughnessTextureRef){
                            await AssetCache.getInstance().createAssetCache(metallicRoughnessTextureRef, "image");
                        }
                        if(normalTextureRef){
                            await AssetCache.getInstance().createAssetCache(normalTextureRef, "image");
                        }
                        if(emissiveTextureRef){
                            await AssetCache.getInstance().createAssetCache(emissiveTextureRef, "image");
                        }
                        if(occlusionTextureRef){
                            await AssetCache.getInstance().createAssetCache(occlusionTextureRef, "image");
                        }
                    }
                }
            }
            if(
                component.type === "SkyBox"
            ){
                await AssetCache.getInstance().createAssetCache(component.hdrRef, "hdr");
            }
        }
    }

    return {
        componentArrs
    };
}
function prepareLight(nodes: NodeState[]){
    LightInfo.getInstance().reset();
    for(const node of nodes){
        const transform = ComponentHelper.FindComponentByType(node.components, "Transform");
        if(!transform) continue;
        const light = ComponentHelper.FindComponentByType(node.components, "Light");
        if(!light) continue;
        const worldPos = NodesInfo.getInstance().getWorldPos(node.id);
        if(!worldPos) continue;
        const worldForward = NodesInfo.getInstance().getWorldAxis(node.id, "z");
        if(!worldForward) continue;
        NodesInfo.getInstance().nodeInfos.get(node.id)
        LightInfo.getInstance().addLight(light, worldPos, worldForward, nodes);
    }
}
function prepareSkyBox(componentArrs: Component[][]){
    SkyBoxInfo.getInstance().reset();
    for(const componentArr of componentArrs){
        for(const component of componentArr){
            if(component.type === "SkyBox"){
                if(SkyBoxInfo.getInstance().uniqueSkyBox){
                    console.warn("scene contains more than 1 skybox");
                }
                SkyBoxInfo.getInstance().setSkyBox(component);
            }
        }
    }
}
