import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { WebglRenderer } from "../../helpers/resource-manager-helper/WebglRenderer";
import { selectNodeRecord, selectNodes, type NodeState } from "../../../../global-state/slices/go-tree-slice";
import { ComponentHelper, Mat3, Mat4, type Component, type FontAsset, type MeshAsset } from "@shot-engine/types";
import { AssetCache } from "../../helpers/asset-cache/asset-cache";
import { LightInfo } from "../../helpers/asset-cache/LightInfo";
import { SkyBoxInfo } from "../../helpers/asset-cache/SkyBoxInfo";
import { ColorCache } from "../../helpers/asset-cache/color-cache";
import { NodesInfo, type NodeRenderState } from "../../../../global-state/thunks/go-tree-thunks";
import { selectGizmoNodes } from "../../../../global-state/slices/gizmo-go-tree-slice";
import { GizmoOrbitCameraInfo } from "../../../../global-state/thunks/gizmo-orbit-camera-thunk";
import { GizmoControl } from "./GizmoControl";
import Yoga, {type Node as YogaNode, Direction, Edge, MeasureMode} from "yoga-layout";
import * as math from "@shot-engine/math";

export function SceneRenderer(){
    const nodes = useAppSelector(state => selectNodes(state));
    const nodeRecord = useAppSelector(selectNodeRecord);
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
        prepareLight(nodes);
    }, [camera, nodes, gizmoNodes]);

    useEffect(() => {
        if(!webglRenderer || !camera || nodes.length === 0) return;

        webglRenderer.clear();

        GlobalSceneNodeRenderer.getInstance().reset();
        const renderer = new SceneNodeRenderer(webglRenderer);
        renderer.renderNodes(nodes, NodesInfo.getInstance().nodeInfos, nodeRecord);

        webglRenderer.renderSkyBox(
            GizmoOrbitCameraInfo.getInstance().viewMat4,
            GizmoOrbitCameraInfo.getInstance().clipMat4,
        );

        webglRenderer.renderGrid(GizmoOrbitCameraInfo.getInstance().vpMat4);

        webglRenderer.renderAxis(GizmoOrbitCameraInfo.getInstance().vpMat4);

        renderer.renderNodes(gizmoNodes, NodesInfo.getInstance().nodeInfos, nodeRecord);
    },[
        camera, nodes, nodeRecord, gizmoNodes, webglRenderer, prepareAssetCount, nodeFocusedId
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
    renderNodes(
        nodes: NodeState[],
        nodeRenderStates: Map<string, NodeRenderState>,
        nodeRecord: Record<string, NodeState>,
    ){
        for(const node of nodes){
            this.renderGo(node, nodeRenderStates, nodeRecord);
            this.renderLayout(node, nodeRenderStates, nodeRecord);
        }
    }
    // calcTextInfo(fontAsset: FontAsset, text: string){
    //     // todo: need cache
    //     type FontInfo = FontAsset["fontInfo"]["chars"][0];
    //     const charMap = new Map<number, FontInfo>(
    //         fontAsset.fontInfo.chars.map(c => [c.id, c])
    //     );
    //     const wordInfos: {
    //         charInfos: (FontInfo | undefined)[]
    //         wordWidth: number,
    //         lineNum: number
    //     }[] = [];
    //     const words = text.split(" ");
    //     for(const word of words){
    //         const charInfos = Array.from(word, (char) => {
    //             const charId = char.codePointAt(0)!;
    //             return charMap.get(charId);
    //         });
    //         let wordWidth = 0;
    //         for(const charInfo of charInfos){
    //             wordWidth += charInfo?.xadvance || 0;
    //         }
    //         wordInfos.push({
    //             charInfos,
    //             wordWidth,
    //             lineNum: 0,
    //         });
    //     }
    //     const textToNumLine = () => {
    //         let textWidth = 0;
    //         let numLine = 0; 
    //         for(const charId of charIds){
    //             const charInfo = charMap.get(charId);
    //             if(!charInfo) continue;
    //             textWidth += charInfo.xadvance;
    //         }
    //     };
    // }
    renderLayout(
        go: NodeState,
        nodeRenderStates: Map<string, NodeRenderState>,
        nodeRecord: Record<string, NodeState>,
    ){
        const uiLayoutComponent = ComponentHelper.FindComponentByType(go.components, "UILayout");
        if(!uiLayoutComponent) return;
        
        let tmpFontRef: string | undefined = undefined; // todo: group font

        type UIElementNode = {
            yogaNode: YogaNode,
            childs: UIElementNode[],
            color?: math.Vec3,
            backgroundColor?: math.Vec3,
            fontSize?: number,
            fontRef?: string,
            textInfo?: {
                charIds: number[],
                charMap: Map<number, FontAsset["fontInfo"]["chars"][0]>,
                fontAsset: FontAsset
            }
        }
        function dfs(
            node: NodeState,
            parent?: UIElementNode,
            index?: number
        ){
            const uiElementComponent = ComponentHelper.FindComponentByType(node.components, "UIElement");
            if(!uiElementComponent) return;
            const { flexDirection, flex, justifyContent, alignItems, gap,
                width, height, margin, padding,
                color, backgroundColor, fontSize, 
            } = uiElementComponent;
            const fontRef = uiElementComponent.fontRef || parent?.fontRef;

            const yogaNode = Yoga.Node.create();

            const uiElementNode: UIElementNode = {
                yogaNode,
                color: color || parent?.color,
                backgroundColor: backgroundColor || parent?.backgroundColor,
                fontSize: fontSize || parent?.fontSize,
                fontRef,
                childs: []
            }

            flexDirection !== undefined && yogaNode.setFlexDirection(flexDirection);
            yogaNode.setFlex(flex);
            justifyContent !== undefined && yogaNode.setJustifyContent(justifyContent);
            alignItems !== undefined && yogaNode.setAlignContent(alignItems);
            yogaNode.setGap(2, gap); // 2-all
            yogaNode.setWidth(width);
            yogaNode.setHeight(height);
            yogaNode.setMargin(Edge.Left, margin?.left);
            yogaNode.setMargin(Edge.Right, margin?.right);
            yogaNode.setMargin(Edge.Top, margin?.top);
            yogaNode.setMargin(Edge.Bottom, margin?.bottom);
            yogaNode.setPadding(Edge.Left, padding?.left);
            yogaNode.setPadding(Edge.Right, padding?.right);
            yogaNode.setPadding(Edge.Top, padding?.top);
            yogaNode.setPadding(Edge.Bottom, padding?.bottom);
            if(uiElementComponent.elementType === "Text" && fontRef){
                tmpFontRef = tmpFontRef || fontRef;
                const fontAsset = AssetCache.getInstance().getFontAssetCache(fontRef);
                if(fontAsset){
                    // uiElementNode.textInfo = {
                    //     charIds,
                    //     charMap,
                    //     fontAsset
                    // }
                    
                    // yogaNode.setMeasureFunc((width, widthMode) => {
                    //     let measuredWidth = textWidthMeasure();
                    //     let measuredHeight = fontAsset.fontInfo.common.lineHeight;
                    //     // width be fixed
                    //     if(widthMode !== MeasureMode.Undefined){
                    //         measuredWidth = width;
                    //     }
                    //     return {
                    //         width: measuredWidth,
                    //         height: measuredHeight
                    //     }
                    // });
                }
            }
            if(parent && index !== undefined){
                parent.yogaNode.insertChild(yogaNode, index);
            }

            for(let i = 0; i < node.childs.length; i++){
                const child = dfs(nodeRecord[node.childs[i]], uiElementNode, i);
                if(child) uiElementNode.childs.push(child);
            }
            return uiElementNode;
        }
        const uiElementNode = dfs(go);
        if(!uiElementNode) return;
        const canvas = getSceneWebglContext().canvas;
        uiElementNode.yogaNode.calculateLayout(canvas.width, canvas.height, Direction.LTR);

        // calculate vertices for ui webgl
        const vertices: number[] = [];
        const v0 = [0, 0, 1, 1, 1, 1];
        const v1 = [0, 0, 1, 1, 1, 1];
        const v2 = [0, 0, 1, 1, 1, 1];
        const v3 = [0, 0, 1, 1, 1, 1];
        // vertex(3), uv(2), color(3), page(1) todo: vertex(2)
        const p0 = [0, 0, 1, 0, 0, 1, 1, 0, 0];
        const p1 = [0, 0, 1, 0, 0, 1, 1, 0, 0];
        const p2 = [0, 0, 1, 0, 0, 1, 1, 0, 0];
        const p3 = [0, 0, 1, 0, 0, 1, 1, 0, 0];
        const textVertices: number[] = [];
        function yogaDFS(node: UIElementNode, parentLeft = 0, parentTop = 0){
            const { yogaNode, backgroundColor } = node;
            const left = parentLeft + yogaNode.getComputedLeft();
            const top = parentTop + yogaNode.getComputedTop();
            const width = yogaNode.getComputedWidth();
            const height = yogaNode.getComputedHeight();

            v0[0] = left + width;
            v0[1] = top;
            v1[0] = left;
            v1[1] = top;
            v2[0] = left;
            v2[1] = top + height;
            v3[0] = left + width;
            v3[1] = top + height;
            if(backgroundColor){
                v0[3] = backgroundColor.values[0];
                v0[4] = backgroundColor.values[1];
                v0[5] = backgroundColor.values[2];

                v1[3] = backgroundColor.values[0];
                v1[4] = backgroundColor.values[1];
                v1[5] = backgroundColor.values[2];

                v2[3] = backgroundColor.values[0];
                v2[4] = backgroundColor.values[1];
                v2[5] = backgroundColor.values[2];

                v3[3] = backgroundColor.values[0];
                v3[4] = backgroundColor.values[1];
                v3[5] = backgroundColor.values[2];
            }
            else{
                v0[3] = 1;
                v0[4] = 1;
                v0[5] = 1;
                v1[3] = 1;
                v1[4] = 1;
                v1[5] = 1;
                v2[3] = 1;
                v2[4] = 1;
                v2[5] = 1;
                v3[3] = 1;
                v3[4] = 1;
                v3[5] = 1;
            }
            vertices.push(
                ...v0,
                ...v1,
                ...v2,
                ...v3
            );

            if(node.textInfo){
                let xStart = left;
                let yStart = top;
                for(const charId of node.textInfo.charIds){
                    const charInfo = node.textInfo.charMap.get(charId);
                    if(!charInfo) continue;
                    const { xoffset, yoffset, width, height, xadvance, page, x, y } = charInfo;
                    const xCursor = xStart + xoffset;
                    const yCursor = yStart + yoffset;
                    p0[0] = xCursor + width;
                    p0[1] = yCursor;
                    p1[0] = xCursor;
                    p1[1] = yCursor;
                    p2[0] = xCursor;
                    p2[1] = yCursor + height;
                    p3[0] = xCursor + width;
                    p3[1] = yCursor + height;
                    // uv
                    const { textureWidth, textureHeight } = node.textInfo.fontAsset.bakeSetting;
                    p0[3] = (x + width) / textureWidth;
                    p0[4] = y / textureHeight;
                    p1[3] = x / textureWidth;
                    p1[4] = y / textureHeight;
                    p2[3] = x / textureWidth;
                    p2[4] = (y + height) / textureHeight;
                    p3[3] = (x + width) / textureWidth;
                    p3[4] = (y + height) / textureHeight;
                    // color
                    // page
                    p0[8] = page;
                    p1[8] = page;
                    p2[8] = page;
                    p3[8] = page;
                    // reset
                    xStart += xadvance;
                    textVertices.push(...p0, ...p1, ...p2, ...p3);
                }
            }

            for(const child of node.childs){
                yogaDFS(child, left, top);
            }
        }
        yogaDFS(uiElementNode);
        uiElementNode.yogaNode.freeRecursive();

        const projectMat3 = new math.Mat3();
        math.Mat3.Projection(projectMat3, canvas.width, canvas.height);
        this._webglRenderer.renderUI(projectMat3, new Float32Array(vertices), vertices.length / 24);

        this._webglRenderer.renderUIText(
            projectMat3, new Float32Array(textVertices), textVertices.length / (9*4), tmpFontRef || ""
        );
    }
    renderGo(
        go: NodeState,
        nodeRenderStates: Map<string, NodeRenderState>,
        nodeRecord: Record<string, NodeState>,
    ){
        // model mat4
        const nodeRenderState = nodeRenderStates.get(go.id);
        let modelMat4 = nodeRenderState?.worldMatrix;
        if(!modelMat4) throw "dont find modelMat4";

        const meshComponent = ComponentHelper.FindComponentByType(go.components, "Mesh");
        if(!meshComponent) return;
        const shadingComponent = ComponentHelper.FindComponentByType(go.components, "Shading");
        if(!shadingComponent) return;
        const skeletonComponent = ComponentHelper.FindComponentByType(go.components, "Skeleton");
        const jointMatrices = this.createJointMatrices(
            skeletonComponent?.rootJointId,
            nodeRenderStates,
            nodeRecord
        );

        const mvpMat4 = this.createMVPMatrix(modelMat4);
        const viewMat4 = GizmoOrbitCameraInfo.getInstance().viewMat4;
        const normalMat3 = this.createNormalMatrix(modelMat4);
        this._webglRenderer.render(
            shadingComponent,
            meshComponent,
            mvpMat4,
            modelMat4,
            viewMat4,
            normalMat3,
            GizmoOrbitCameraInfo.getInstance().worldPos,
            GizmoOrbitCameraInfo.getInstance().vpMat4,
            jointMatrices
        );

        const meshAsset = AssetCache.getInstance().getMeshAssetCache(meshComponent.meshRef);
        GlobalSceneNodeRenderer.getInstance().nodeRenderInfos.set(go.id, {
            meshAsset
        });

        return { modelMat4 };
    }
    createJointMatrices(
        rootJointId: string | undefined,
        nodeRenderStates: Map<string, NodeRenderState>,
        nodeRecord: Record<string, NodeState>,
    ){
        if(!rootJointId) return new Float32Array();
        const jointMatrices: number[][] = [];
        function recur(jointId: string){
            const jointNode = nodeRecord[jointId];
            if(!jointNode) return;
            const jointMatrix = nodeRenderStates.get(jointId)?.worldMatrix;
            if(!jointMatrix) return;
            jointMatrices.push(jointMatrix.values);
            for(const child of jointNode.childs){
                recur(child);
            }
        }
        recur(rootJointId);
        return new Float32Array(jointMatrices.flat());
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
                component.shaderType === "pbr"
            ){
                if(component.diffuse.type === "image"){
                    await AssetCache.getInstance().createAssetCache(component.diffuse.imageRef, "image");
                }
                if(component.metallic.type === "image"){
                    await AssetCache.getInstance().createAssetCache(component.metallic.imageRef, "image");
                }
                if(component.roughness.type === "image"){
                    await AssetCache.getInstance().createAssetCache(component.roughness.imageRef, "image");
                }
                if(component.emissive.color.type === "image"){
                    await AssetCache.getInstance().createAssetCache(component.emissive.color.imageRef, "image");
                }
                if(component.normal.type === "image"){
                    await AssetCache.getInstance().createAssetCache(component.normal.imageRef, "image");
                }
                if(component.ao.type === "image"){
                    await AssetCache.getInstance().createAssetCache(component.ao.imageRef, "image");
                }
            }
            if(
                component.type === "SkyBox"
            ){
                await AssetCache.getInstance().createAssetCache(component.hdrRef, "hdr");
            }
            if(component.type === "UIElement" && component.fontRef){
                await AssetCache.getInstance().createAssetCache(component.fontRef, "font");
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
