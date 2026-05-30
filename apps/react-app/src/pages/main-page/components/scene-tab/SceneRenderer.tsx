import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";
import { mat4, quat, vec3, mat3 } from "gl-matrix";
import { sphereCoordinateToCartesian } from "../../helpers/math-helpers/sphere-coordinate-helpers";
import { clamp } from "@math.gl/core";
import { getSceneCanvas, getSceneWebglContext } from "../../helpers/resource-manager-helper/CanvasHelper";
import { WebglRenderer } from "../../helpers/resource-manager-helper/WebglRenderer";
import { OrbitCameraHelper } from "../../helpers/resource-manager-helper/OrbitCameraHelper";
import { selectNodeRecord, selectNodes, type NodeState } from "../../../../global-state/slices/go-tree-slice";
import type { Component, GameObject, PrefabAsset, SceneNode, Transform } from "@shot-engine/types";
import { AssetCache } from "../../helpers/asset-cache/asset-cache";
import { LightInfo } from "../../helpers/asset-cache/LightInfo";
import { cloneDeep } from "lodash";
import { SkyBoxInfo } from "../../helpers/asset-cache/SkyBoxInfo";
import { ColorCache } from "../../helpers/asset-cache/color-cache";

export function SceneRenderer(){
    const nodes = useAppSelector(state => selectNodes(state));
    const rootIds = useAppSelector(state => state.goTree.rootIds);
    const nodeRecord = useAppSelector(state => selectNodeRecord(state));

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [camera, setCamera] = useState<SceneFormat.SceneOrbitCamera | null>(null);
    const [webglRenderer, setWebglRenderer] = useState<WebglRenderer | null>(null);
    const [clickedOn, setClickedOn] = useState(false);
    const [altOn, setAltOn] = useState(false);
    const [prepareAssetCount, setPrepareAssetCount] = useState(0);

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
            canvas.height = Math.round(height * dpr);
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
        const controller = new AbortController();
        const handler = async () => {
            const signal = controller.signal;

            const { componentArrs } = await prepareAsset(nodes, signal);
            if(signal.aborted) return;
            AssetCache.getInstance().deleteUnused();

            prepareColorTexture(componentArrs);
            prepareLight(componentArrs);
            prepareSkyBox(componentArrs);
            setPrepareAssetCount(state => state + 1);
        }
        handler();
        return () => {
            controller.abort();
        }
    }, [nodes]);

    useEffect(() => {
        if(!webglRenderer || !camera || rootIds.length === 0) return;

        webglRenderer.clear();
        const renderer = new SceneNodeRenderer(camera, webglRenderer);
        renderer.renderNodes(rootIds, nodeRecord, null);

        webglRenderer.renderSkyBox(
            OrbitCameraHelper.createViewMatrix(camera),
            OrbitCameraHelper.createClipMatrix(camera),
        );
        webglRenderer.renderGrid(OrbitCameraHelper.createVPMatrix(camera));
        webglRenderer.debug();

    }, [camera, rootIds, nodeRecord, webglRenderer, prepareAssetCount]);

    return (
        <div className="flex-1 flex">
            <canvas ref={canvasRef} id="scene-canvas" className="w-full h-full"
                onMouseDown={() => { setClickedOn(true); }}
                onWheel={(e) => {
                    if(!camera) return;
                    const dir = Math.sign(e.deltaY);
                    const cameraClone = cloneDeep(camera);
                    cameraClone.sphereCoordinate.r += dir * 0.5;
                    cameraClone.sphereCoordinate.r = Math.max(cameraClone.sphereCoordinate.r, 1);
                    setCamera(cameraClone);
                }}
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
                    onCameraChange={() => {
                        setCamera({...camera});
                    }}
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
            if(e.altKey) e.preventDefault();
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
                theta -= deltaX * 0.15;
                phi += deltaY * 0.15;
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
    renderNodes(
        nodeInputs: string[] | SceneNode[],
        nodeRecord: Record<string, NodeState>,
        parentDataIn: ParentData | null
    ){
        for(const nodeInput of nodeInputs){
            let node: NodeState | SceneNode;
            if(typeof nodeInput === "string"){
                node = nodeRecord[nodeInput];
                if(!node) return;
            }
            else{
                node = nodeInput;
            }
            if("childs" in node){
                const parentData = this.renderGo(node, parentDataIn);
                this.renderNodes(node.childs, nodeRecord, parentData);
            }
            else{
                const assetCache = AssetCache.getInstance().getAssetCache(node.prefabRef);
                if(!assetCache || !assetCache.asset){
                    console.warn("cant find prefab asset with id", node.prefabRef);
                    return;
                }
                const prefabAsset = assetCache.asset as PrefabAsset;
                const parentData = this.renderGo(prefabAsset.root, parentDataIn);
                this.renderNodes(prefabAsset.root.childs, nodeRecord, parentData);
            }
        }
    }
    renderGo(
        go: Omit<GameObject, "childs">,
        parentDataIn: ParentData | null
    ): ParentData | null
    {
        const transformComponent = this.findComponentByType(go.components, "Transform");
        if(!transformComponent) throw "dont find Transform component";
        const modelMat4 = this.createModelMatrix(transformComponent);
        if(parentDataIn) mat4.multiply(modelMat4, parentDataIn.modelMat4, modelMat4);
        const meshComponent = this.findComponentByType(go.components, "Mesh");
        if(!meshComponent) return { modelMat4 }
        const shadingComponent = this.findComponentByType(go.components, "Shading");
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
    findComponentByType<T extends Component["type"]>(
        components: Component[],
        type: T
    ){
        return components.find(c => c.type == type) as Extract<Component, { type: T }> | undefined;
    }
    createModelMatrix(transformComponent: Transform){
        const { pos, rot, scale } = transformComponent;
        const modelMat4 = mat4.create();
        const q = quat.fromValues(rot.x, rot.y, rot.z, rot.w);
        mat4.fromRotationTranslationScale(
            modelMat4, q, [pos.x, pos.y, pos.z], [scale.x, scale.y, scale.z]
        );
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
async function prepareAsset(nodes: NodeState[], signal: AbortSignal){
    const componentArrs: Component[][] = [];
    const gameObjects: GameObject[] = [];
    async function getPrefabRoot(prefabRef: string){
        const assetCache = await AssetCache.getInstance().createAssetCache(prefabRef, "prefab");
        if(!assetCache || !assetCache.asset){
            console.warn("cant find prefab asset with id", prefabRef);
            return;
        }
        const prefabAsset = assetCache.asset as PrefabAsset;
        gameObjects.push(prefabAsset.root);
    }
    for(const node of nodes){
        if(signal.aborted) break;
        if("components" in node){
            componentArrs.push(node.components);
        }
        else{
            await getPrefabRoot(node.prefabRef);
        }
    }
    for(const go of gameObjects){
        if(signal.aborted) break;
        componentArrs.push(go.components);
        for(const child of go.childs){
            if("components" in child) gameObjects.push(child);
            else{
                await getPrefabRoot(child.prefabRef);
            }
        }
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
