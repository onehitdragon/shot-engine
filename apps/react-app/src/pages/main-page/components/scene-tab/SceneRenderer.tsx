import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { WebglRenderer } from "../../helpers/resource-manager-helper/WebglRenderer";
import { selectNodes, type NodeState } from "../../../../global-state/slices/go-tree-slice";
import { ComponentHelper, Mat3, Mat4, type Component, type MeshAsset, type Transform } from "@shot-engine/types";
import { AssetCache } from "../../helpers/asset-cache/asset-cache";
import { LightInfo } from "../../helpers/asset-cache/LightInfo";
import { SkyBoxInfo } from "../../helpers/asset-cache/SkyBoxInfo";
import { ColorCache } from "../../helpers/asset-cache/color-cache";
import { NodesInfo, type NodeRenderState } from "../../../../global-state/thunks/go-tree-thunks";
import { selectGizmoNodes } from "../../../../global-state/slices/gizmo-go-tree-slice";
import { GizmoOrbitCameraInfo } from "../../../../global-state/thunks/gizmo-orbit-camera-thunk";
import { GizmoControl } from "./GizmoControl";

export function SceneRenderer(){
    const nodes = useAppSelector(state => selectNodes(state));
    const nodeFocusedId = useAppSelector(state => state.goTree.focusedId);

    const gizmoNodes = useAppSelector(state => selectGizmoNodes(state));

    const camera = useAppSelector(state => state.gizmoOrbitCamera.camera);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [webglRenderer, setWebglRenderer] = useState<WebglRenderer | null>(null);
    const [prepareAssetCount, setPrepareAssetCount] = useState(0);

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

            prepareColorTexture(componentArrs);
            prepareLight(componentArrs);
            prepareSkyBox(componentArrs);
            setPrepareAssetCount(state => state + 1);
        }
        handler();
        return () => {
            controller1.abort();
            controller2.abort();
        }
    }, [nodes, gizmoNodes]);

    useEffect(() => {
        if(!webglRenderer || !camera || nodes.length === 0) return;

        webglRenderer.clear();

        webglRenderer.renderAxis(GizmoOrbitCameraInfo.getInstance().vpMat4);

        GlobalSceneNodeRenderer.getInstance().reset();
        const renderer = new SceneNodeRenderer(webglRenderer);
        renderer.renderNodes(nodes, NodesInfo.getInstance().nodeInfos);

        webglRenderer.renderSkyBox(
            GizmoOrbitCameraInfo.getInstance().viewMat4,
            GizmoOrbitCameraInfo.getInstance().clipMat4,
        );

        webglRenderer.renderGrid(GizmoOrbitCameraInfo.getInstance().vpMat4);

        

        renderer.renderNodes(gizmoNodes, NodesInfo.getInstance().nodeInfos);
    },[
        camera, nodes, gizmoNodes, webglRenderer, prepareAssetCount, nodeFocusedId
    ]);

    return (
        <div className="flex-1 flex relative">
            <canvas ref={canvasRef} id="scene-canvas" className="w-full h-full">
                Dont supports "canvas"
            </canvas>
            <GizmoControl />
        </div>
    );
}
export class SceneNodeRenderer{
    private _webglRenderer: WebglRenderer;
    constructor( webglRenderer: WebglRenderer){
        this._webglRenderer = webglRenderer;
    }
    renderNodes(nodes: NodeState[], nodeRenderStates: Map<string, NodeRenderState>){
        for(const node of nodes){
            this.renderGo(node, nodeRenderStates.get(node.id));
        }
    }
    renderGo(go: NodeState, nodeRenderState?: NodeRenderState)
    {
        // model mat4
        let modelMat4 = nodeRenderState?.worldMatrix;
        if(!modelMat4) throw "dont find modelMat4";

        const meshComponent = ComponentHelper.FindComponentByType(go.components, "Mesh");
        if(!meshComponent) return;
        const shadingComponent = ComponentHelper.FindComponentByType(go.components, "Shading");
        if(!shadingComponent) return;
        const mvpMat4 = this.createMVPMatrix(modelMat4);
        const normalMat3 = this.createNormalMatrix(modelMat4);
        this._webglRenderer.render(
            shadingComponent,
            meshComponent,
            mvpMat4,
            modelMat4,
            normalMat3,
            GizmoOrbitCameraInfo.getInstance().worldPos
        );

        const meshAsset = AssetCache.getInstance().getMeshAssetCache(meshComponent.meshRef);
        GlobalSceneNodeRenderer.getInstance().nodeRenderInfos.set(go.id, {
            meshAsset
        });

        return { modelMat4 };
    }
    createMVPMatrix(modelMat4: Mat4){
        return Mat4.Multiply(GizmoOrbitCameraInfo.getInstance().vpMat4, modelMat4); // P * V * M
    }
    createNormalMatrix(modelMat4: Mat4){
        return Mat3.NormalFromMat4(modelMat4);
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
            if(component.type === "Mesh"){
                await AssetCache.getInstance().createAssetCache(component.meshRef, "mesh");
            }
            if(
                component.type === "Shading" && 
                component.shaderType === "phong" &&
                component.diffuse.type === "image"
            ){
                await AssetCache.getInstance().createAssetCache(component.diffuse.imageRef, "image");
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
function prepareColorTexture(componentArrs: Component[][]){
    for(const componentArr of componentArrs){
        for(const component of componentArr){
            if(component.type === "Shading"){
                if(component.shaderType === "phong" || component.shaderType === "pbr"){
                    if(component.diffuse.type === "color"){
                        ColorCache.getInstance().createColorTexture(component.diffuse.color);
                    }
                }
            }
        }
    }
    ColorCache.getInstance().deleteUnused();
}
function prepareLight(componentArrs: Component[][]){
    LightInfo.getInstance().reset();
    for(const componentArr of componentArrs){
        let transform: Transform | undefined;
        for(const component of componentArr){
            if(component.type === "Transform"){
                transform = component;
            }
            if(component.type === "Light"){
                if(!transform){
                    console.warn("light component but dont have transform component");
                }
                else{
                    LightInfo.getInstance().addLight(component, transform);
                }
            }
        }
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
