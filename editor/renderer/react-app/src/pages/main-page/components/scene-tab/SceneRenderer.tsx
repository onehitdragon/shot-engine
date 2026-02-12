import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { mat4, quat, vec3, mat3 } from "gl-matrix";
import { sphereCoordinateToCartesian } from "../../helpers/math-helpers/sphere-coordinate-helpers";
import { clamp } from "@math.gl/core";
import { addAppListener } from "../../../../global-state/listenerMiddleware";
import { getSceneCanvas, getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { selectSceneNodeRecord, selectSceneNodes } from "../../../../global-state/slices/scene-manager-slice";
import { WebglRenderer } from "../../helpers/resource-manager-helper/WebglRenderer";
import { OrbitCameraHelper } from "../../helpers/resource-manager-helper/OrbitCameraHelper";

export function SceneRenderer(){
    const scene = useAppSelector(state => state.sceneManager.scene);
    const sceneNodeRecord = useAppSelector(state => selectSceneNodeRecord(state));
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [camera, setCamera] = useState<SceneFormat.SceneOrbitCamera | null>(null);
    const [webglRenderer, setWebglRenderer] = useState<WebglRenderer | null>(null);
    const [clickedOn, setClickedOn] = useState(false);
    const [altOn, setAltOn] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const webgl2 = getSceneWebglContext();
        const canvas = getSceneCanvas();
        const camera = getCamera(canvas);
        if(!camera) return;
        setWebglRenderer(WebglRenderer.getInstance(webgl2));
        setCamera(camera);
        const observer = new ResizeObserver((entries) => {
            const dpr = window.devicePixelRatio || 1;
            const { width, height } = entries[0].contentRect;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);;
            webgl2.viewport(0, 0, canvas.width, canvas.height);
            camera.aspect = width / height;
            setCamera({...camera});
        });
        observer.observe(canvasRef.current!);
        return () => {
            observer.disconnect();
        }
    }, []);
    useEffect(() => {
        if(!webglRenderer) return;
        const unsub1 = dispatch(addAppListener({
            predicate: (_, curState, originState) => {
                return curState.sceneManager.entities != originState.sceneManager.entities;
            },
            effect: (_, { getState }) => {
                const nodes = selectSceneNodes(getState());
                webglRenderer.lightSceneNodeManager.update(nodes); // todo
            }
        }));
        return () => {
            unsub1();
        }
    }, [webglRenderer]);
    useEffect(() => {
        if(!webglRenderer) return;
        webglRenderer.clear();
        if(!scene) return;
        if(!camera) return;
        const handler = () => {
            const renderer = new SceneNodeRenderer(camera, webglRenderer);
            renderer.renderSceneNodes(scene.nodes, sceneNodeRecord, null);
        }
        handler();
        webglRenderer.renderGrid(OrbitCameraHelper.createVPMatrix(camera));
        webglRenderer.debug();
        return () => {
            
        }
    }, [scene, sceneNodeRecord, webglRenderer, camera]);

    return (
        <div className="flex-1 flex">
            <canvas ref={canvasRef} id="scene-canvas" className="w-full h-full"
                onMouseDown={() => { setClickedOn(true); }}
            >
                Dont supports "canvas"
            </canvas>
            <WindowEvents
                onKeyDown={(e) => e.altKey && setAltOn(true)}
                onKeyUp={() => setAltOn(false)}
            />
            {
                (clickedOn && camera) &&
                <CameraMovement
                    onMouseUp={() => { setClickedOn(false) }} alt={altOn}
                    camera={camera}
                    onCameraChange={() => setCamera({...camera})}
                />
            }
        </div>
    );
}
function WindowEvents(props: {
    onKeyDown?: (e: KeyboardEvent) => void,
    onKeyUp?: (e: KeyboardEvent) => void,
}){
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            props.onKeyDown?.(e);
        }
        const onKeyUp = (e: KeyboardEvent) => {
            props.onKeyUp?.(e);
        }
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        }
    }, [])
    return <></>
}
function CameraMovement(props: {
    onMouseUp: () => void, alt: boolean,
    camera: SceneFormat.SceneOrbitCamera,
    onCameraChange: () => void
}){
    const { alt, camera, onCameraChange } = props;
    useEffect(() => {
        const onMouseUp = () => {
            props.onMouseUp();
        }
        let lastX = 0;
        let lastY = 0;
        const onMouseDown = (e: MouseEvent) => {
            lastX = e.clientX;
            lastY = e.clientY;
        } 
        const onMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            if(alt){
                let { theta, phi } = camera.sphereCoordinate;
                theta -= deltaX;
                phi += deltaY;
                phi = clamp(phi, -89, 89);
                camera.sphereCoordinate.theta = theta;
                camera.sphereCoordinate.phi = phi;
            }
            else{
                const { r, theta, phi } = camera.sphereCoordinate;
                const camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
                vec3.add(camWorldPos, camera.origin, camWorldPos);
                const forward = vec3.sub([], camera.origin, camWorldPos);
                const right = vec3.cross([], forward, [0, 1, 0]);
                const up = vec3.cross([], right, forward);
                vec3.normalize(forward, forward);
                vec3.normalize(right, right);
                vec3.normalize(up, up);
                vec3.add(camera.origin, camera.origin, vec3.scale([], right, -deltaX * 0.05));
                vec3.add(camera.origin, camera.origin, vec3.scale([], up, deltaY * 0.05));
            }
            onCameraChange();
        }
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        return () =>{
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
        }
    }, []);

    return <></>
}
function getCamera(canvas: HTMLCanvasElement): SceneFormat.SceneOrbitCamera | null{
    return {
        aspect: canvas.clientWidth / canvas.clientHeight,
        sphereCoordinate: { r: 5, theta: 0, phi: 0 },
        origin: [0, 0, 0]
    }
}
type ParentData = {
    modelMat4: mat4
}
class SceneNodeRenderer{
    private _camWorldPos: vec3;
    private _viewMat4: mat4;
    private _clipMat4: mat4;
    private _webglRenderer: WebglRenderer;
    constructor(camera: SceneFormat.SceneOrbitCamera, webglRenderer: WebglRenderer){
        this._camWorldPos = vec3.create();
        this._viewMat4 = this.createViewMatrix(camera); // set camWorldPos
        this._clipMat4 = this.createClipMatrix(camera);
        this._webglRenderer = webglRenderer;
    }
    renderSceneNodes(
        nodes: string[],
        nodeRecord: Record<string, SceneFormat.SceneNode>,
        parentDataIn: ParentData | null
    ){
        for(const nodeId of nodes){
            const node = nodeRecord[nodeId];
            const parentData = this.renderNode(node, parentDataIn);
            this.renderSceneNodes(node.childs, nodeRecord, parentData);
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
        const normalMat3 = this.createNormalMatrix(modelMat4);
        this._webglRenderer.render(
            shadingComponent,
            meshComponent,
            mvpMat4,
            modelMat4,
            normalMat3,
            this._camWorldPos
        );

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
    createViewMatrix(camera: SceneFormat.SceneOrbitCamera){
        const { sphereCoordinate, origin } = camera;
        const { r, theta, phi } = sphereCoordinate;
        const camWorldPos = sphereCoordinateToCartesian(r, theta, phi);
        vec3.add(camWorldPos, origin, camWorldPos);
        const viewMat4 = mat4.create();
        mat4.lookAt(viewMat4, camWorldPos, origin, [0, 1, 0]);
        this._camWorldPos = camWorldPos;
        return viewMat4;
    }
    createClipMatrix(camera: SceneFormat.SceneOrbitCamera){
        const clipMat4 = mat4.create();
        mat4.perspective(clipMat4, 45 * Math.PI / 180, camera.aspect, 1, 100);
        return clipMat4;
    }
    createMVPMatrix(modelMat4: mat4){
        const mvpMat4 = mat4.create();
        mat4.multiply(mvpMat4, this._clipMat4, this._viewMat4);
        mat4.multiply(mvpMat4, mvpMat4, modelMat4); // P * V * M
        return mvpMat4;
    }
    createNormalMatrix(modelMat4: mat4){
        const normalMat3 = mat3.create();
        mat3.normalFromMat4(normalMat3, modelMat4);
        return normalMat3;
    }
}
