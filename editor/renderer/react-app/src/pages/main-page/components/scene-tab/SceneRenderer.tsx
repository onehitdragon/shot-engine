import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { mat4, quat, vec3 } from "gl-matrix";
import { WebglRenderer } from "../../helpers/WebglRenderer";

export function SceneRenderer(){
    const sceneGraph = useAppSelector(state => state.sceneManager.sceneGraph);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [camera, setCamera] = useState<SceneFormat.SceneCamera | null>(null);
    const [webglRenderer, setWebglRenderer] = useState<WebglRenderer | null>(null);
    
    useEffect(() => {
        if(!canvasRef) return;
        const webgl2 = getWebgl2(canvasRef.current);
        if(!webgl2) return;
        const cam = getCamera(canvasRef.current);
        if(!cam) return;
        setWebglRenderer(WebglRenderer.getInstance(webgl2));
        setCamera(cam);
    }, []);

    useEffect(() => {
        if(!sceneGraph) return;
        if(!webglRenderer) return;
        if(!camera) return;
        webglRenderer.clear();
        const handler = () => {
            const renderer = new SceneNodeRenderer(camera, webglRenderer);
            renderer.renderSceneNodes(sceneGraph.nodes, null);
        }
        handler();
        return () => {

        }
    }, [sceneGraph, webglRenderer, camera]);

    return (
        <div className="flex-1 flex">
            <canvas ref={canvasRef} id="scene-canvas" className="w-full h-full">
                Dont supports "canvas"
            </canvas>
        </div>
    );
}
function getWebgl2(canvas: HTMLCanvasElement | null){
    if(!canvas) return null;
    const gl = canvas.getContext("webgl2");
    if(!gl) return null;
    return gl;
}
function getCamera(canvas: HTMLCanvasElement | null): SceneFormat.SceneCamera | null{
    if(!canvas) return null;
    return {
        aspect: canvas.clientWidth / canvas.clientHeight,
        position: [0, 0, 5],
        rotation: [0, 0, 0]
    }
}
type ParentData = {
    modelMat4: mat4
}
class SceneNodeRenderer{
    private viewMat4: mat4;
    private clipMat4: mat4;
    private _webglRenderer: WebglRenderer;
    constructor(camera: SceneFormat.SceneCamera, webglRenderer: WebglRenderer){
        this.viewMat4 = this.createViewMatrix(camera);
        this.clipMat4 = this.createClipMatrix(camera);
        this._webglRenderer = webglRenderer;
    }
    renderSceneNodes(nodes: SceneFormat.SceneNode[], parentDataIn: ParentData | null){
        for(const node of nodes){
            const parentData = this.renderNode(node, parentDataIn);
            this.renderSceneNodes(node.childs, parentData);
        }
    }
    renderNode(node: SceneFormat.SceneNode, parentDataIn: ParentData | null): ParentData | null{
        const { components } = node;
        const transformComponent = this.findComponentByType(components, "Transform");
        if(!transformComponent) throw "dont find Transform component";
        const modelMat4 = this.createModelMatrix(transformComponent);
        if(parentDataIn) mat4.multiply(modelMat4, parentDataIn.modelMat4, modelMat4);
        const meshComponent = this.findComponentByType(components, "Mesh");
        if(!meshComponent) return { modelMat4 }
        const shadingComponent = this.findComponentByType(components, "Shading");
        if(!shadingComponent) return { modelMat4 }

        const mvpMat4 = this.createMVPMatrix(modelMat4);
        this._webglRenderer.render(shadingComponent, meshComponent, mvpMat4);

        return { modelMat4 };
    }
    findComponentByType<T extends Components.Component["type"]>(
        components: Components.Component[],
        type: T
    ){
        return components.find(c => c.type == type) as Extract<Components.Component, { type: T }> | undefined;
    }
    createModelMatrix(transformComponent: Components.Transform){
        const { position, rotation, scale } = transformComponent;
        const modelMat4 = mat4.create();
        const q = quat.create();
        quat.fromEuler(q, rotation[0], rotation[1], rotation[2], "yxz");
        mat4.fromRotationTranslationScale(modelMat4, q, position, scale);
        return modelMat4;
    }
    createViewMatrix(camera: SceneFormat.SceneCamera){
        const { position, rotation } = camera;
        const viewMat4 = mat4.create();
        const q = quat.create();
        quat.fromEuler(q, rotation[0], rotation[1], rotation[2], "yxz");
        quat.conjugate(q, q);
        mat4.fromQuat(viewMat4, q);
        mat4.translate(viewMat4, viewMat4, vec3.negate([], position));
        return viewMat4;
    }
    createClipMatrix(camera: SceneFormat.SceneCamera){
        const clipMat4 = mat4.create();
        mat4.perspective(clipMat4, 45 * Math.PI / 180, camera.aspect, 1, 100);
        return clipMat4;
    }
    createMVPMatrix(modelMat4: mat4){
        const mvpMat4 = mat4.create();
        mat4.multiply(mvpMat4, this.clipMat4, this.viewMat4);
        mat4.multiply(mvpMat4, mvpMat4, modelMat4); // P * V * M
        return mvpMat4;
    }
}
