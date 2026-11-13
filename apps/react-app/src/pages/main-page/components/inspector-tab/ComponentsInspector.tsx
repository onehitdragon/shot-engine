import type { AssetManager, Camera, Component, Light, MeshRenderer, PointLight, SkinnedMeshRenderer, SkyBox, SpotLight, Transform, UILayout } from "@shot-engine/types";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { selectComponents } from "../../../../global-state/slices/inspector-components-slice";
import { cloneDeep } from "lodash";
import { componentUpdatedThunk } from "../../../../global-state/thunks/inspector-components-thunks";
import { ThreeValueRow, RGBValueRow, CheckBox, OneValueRow, Selection, TextOrStringSelection, MeshSelection, AssetSelectionList, GameObjectSelectionList } from "./components";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { ColorToVec3, ObjectToVec3, Vec3ToColor, Vec3ToObject } from "./helper";
import { Quat } from "@shot-engine/math";

export function ComponentsInspector(){
    const components = useAppSelector(state => selectComponents(state));

    return (
        <div className="flex flex-col gap-3 flex-1 p-1 overflow-auto scrollbar-thin">
            {
                components.map(component => {
                    if(component.type === "Transform"){
                        return <TransformSection
                            key={component.id}
                            transform={component}
                        />;
                    }
                    else if(component.type === "MeshRenderer"){
                        return <MeshRenderer key={component.id} meshRenderer={component}/>;
                    }
                    else if(component.type === "SkinnedMeshRenderer"){
                        return <SkinnedMeshRenderer key={component.id} skinnedMeshRenderer={component}/>
                    }
                    else if(component.type === "Light"){
                        return <LightSection key={component.id} light={component}/>
                    }
                    else if(component.type === "Camera"){
                        return <CameraSection key={component.id} camera={component}/>
                    }
                    else if(component.type === "SkyBox"){
                        return <SkyBoxSection key={component.id} skyBox={component}/>
                    }
                    else if(component.type === "UILayout"){
                        return <UILayout key={component.id} uiLayout={component}/>
                    }
                })
            }
        </div>
    );
}
function TransformSection(props: { transform: Transform }){
    const { transform } = props;
    const dispatch = useAppDispatch();
    const transformClone = cloneDeep(transform);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: transformClone }));
    }

    return (
        <div className="flex flex-col">
            <Header label="Transform" component={transform}/>
            <div className="flex flex-col">
                <ThreeValueRow
                    label="Position"
                    value={Vec3ToObject(transform.pos)}
                    onChange={(value) => {
                        transformClone.pos = ObjectToVec3(value);
                        update();
                    }}
                />
                <ThreeValueRow
                    label="Rotation"
                    value={Vec3ToObject(transform.editor.euler)}
                    onChange={(value) => {
                        const q = new Quat();
                        Quat.FromEuler(q, value.x, value.y, value.z, "yxz");
                        transformClone.editor.euler = ObjectToVec3(value);
                        transformClone.rot = q;
                        update();
                    }}
                />
                <ThreeValueRow
                    label="Scale"
                    value={Vec3ToObject(transform.scale)}
                    onChange={(value) => {
                        transformClone.scale = ObjectToVec3(value);
                        update();
                    }}
                />
            </div>
        </div>
    );
}
function MeshRenderer(props: { meshRenderer: MeshRenderer }){
    const { meshRenderer } = props;
    const dispatch = useAppDispatch();
    const meshRendererClone = cloneDeep(meshRenderer);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: meshRendererClone }));
    }
    
    return (
        <div className="flex flex-col gap-2">
            <Header label="Mesh Renderer" component={meshRenderer}/>
            <MeshSelection label="Mesh"
                uuidRef={meshRenderer.meshRef}
                onChange={(value) => {
                    meshRendererClone.meshRef = value;
                    update();
                }}
            />
            <AssetSelectionList label="Materials" type="material"
                uuidRefs={meshRenderer.materialRefs}
                onItemChange={(index, value) => {
                    meshRendererClone.materialRefs[index] = value;
                    update();
                }}
                onItemAdd={() => {
                    meshRendererClone.materialRefs.push(undefined);
                    update();
                }}
                onItemDelete={(index) => {
                    meshRendererClone.materialRefs.splice(index, 1);
                    update();
                }}
            />
        </div>
    );
}
function SkinnedMeshRenderer(props: { skinnedMeshRenderer: SkinnedMeshRenderer }){
    const { skinnedMeshRenderer } = props;
    const dispatch = useAppDispatch();
    const skinnedMeshRendererClone = cloneDeep(skinnedMeshRenderer);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: skinnedMeshRendererClone }));
    }
    
    return (
        <div className="flex flex-col gap-2">
            <Header label="Skinned Mesh Renderer" component={skinnedMeshRenderer}/>
            <MeshSelection label="Mesh"
                uuidRef={skinnedMeshRenderer.meshRef}
                onChange={(value) => {
                    skinnedMeshRendererClone.meshRef = value;
                    update();
                }}
            />
            <AssetSelectionList label="Materials" type="material"
                uuidRefs={skinnedMeshRenderer.materialRefs}
                onItemChange={(index, value) => {
                    skinnedMeshRendererClone.materialRefs[index] = value;
                    update();
                }}
                onItemAdd={() => {
                    skinnedMeshRendererClone.materialRefs.push(undefined);
                    update();
                }}
                onItemDelete={(index) => {
                    skinnedMeshRendererClone.materialRefs.splice(index, 1);
                    update();
                }}
            />
            <GameObjectSelectionList label="Joints" fiexed
                uuidRefs={skinnedMeshRenderer.jointRefs}
                onItemChange={(index, value) => {
                    skinnedMeshRendererClone.jointRefs[index] = value;
                    update();
                }}
                onItemAdd={() => {
                    skinnedMeshRendererClone.jointRefs.push(undefined);
                    update();
                }}
                onItemDelete={(index) => {
                    skinnedMeshRendererClone.jointRefs.splice(index, 1);
                    update();
                }}
            />
        </div>
    );
}
function LightSection(props: { light: Light }){
    const { light } = props;
    let label = "";
    if(light.lightType === "DirectionalLight") label = "Direction Light";
    if(light.lightType === "PointLight") label = "Point Light";
    if(light.lightType === "SpotLight") label = "Spot Light";

    return (
        <div className="flex flex-col">
            <Header label={label} component={light}/>
            <BaseLightEditor baseLight={light}/>
            { light.lightType === "PointLight" && <PointLightEditor pointLight={light}/> }
            { light.lightType === "DirectionalLight" && <DirectionalLightEditor /> }
            { light.lightType === "SpotLight" && <SpotLightEditor spotLight={light}/> }
        </div>
    );
}
function BaseLightEditor(props: { baseLight: Light }){
    const { baseLight } = props;
    const { color, intensity, shadow } = baseLight;
    const baseLightClone = cloneDeep(baseLight);
    const dispatch = useAppDispatch();
    const update = () => {
        dispatch(componentUpdatedThunk({ component: baseLightClone }));
    }

    return (
        <div className="flex flex-col">
            <RGBValueRow
                label="Color"
                value={Vec3ToColor(color)}
                onChange={(value) => {
                    baseLightClone.color = ColorToVec3(value);
                    update();
                }}
            />
            <OneValueRow
                label="Intensity"
                value={intensity}
                range={[0, Number.MAX_VALUE]}
                onChange={(value) => {
                    baseLightClone.intensity = value;
                    update();
                }}
            />
            <CheckBox
                label="Shadow"
                value={shadow.enable}
                onChange={(value) => {
                    baseLightClone.shadow.enable = value;
                    update();
                }}
            />
            {
                shadow.enable &&
                <>
                    <OneValueRow
                        label="Bias"
                        value={shadow.bias}
                        onChange={(value) => {
                            baseLightClone.shadow.bias = value;
                            update();
                        }}
                    />
                    <OneValueRow
                        label="Normal bias"
                        value={shadow.normalBias}
                        onChange={(value) => {
                            baseLightClone.shadow.normalBias = value;
                            update();
                        }}
                    />
                    <Selection
                        label="Map size"
                        value={shadow.mapSize}
                        options={[
                            { label: "512", value: 512 },
                            { label: "1024", value: 1024 },
                            { label: "2048", value: 2048 }
                        ]}
                        onChange={(value) => {
                            baseLightClone.shadow.mapSize = value;
                            update();
                        }}
                    />
                    <Selection
                        label="Soft shadow"
                        value={shadow.softShadow}
                        options={[
                            { label: "Hard", value: "hard" },
                            { label: "Smooth", value: "smooth" }
                        ]}
                        onChange={(value) => {
                            baseLightClone.shadow.softShadow = value;
                            update();
                        }}
                    />
                </>
            }
        </div>
    );
}
function PointLightEditor(props: { pointLight: PointLight }){
    const { pointLight } = props;
    const { radius } = pointLight;
    const dispatch = useAppDispatch();
    const pointLightClone = cloneDeep(pointLight);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: pointLightClone }));
    }

    return (
        <div className="flex flex-col">
            <OneValueRow
                label="Radius"
                value={radius}
                range={[0, Number.MAX_VALUE]}
                onChange={(value) => {
                    pointLightClone.radius = value;
                    update();
                }}
            />
        </div>
    );
}
function DirectionalLightEditor(){
    return (
        <div className="flex flex-col">
        </div>
    );
}
function SpotLightEditor(props: { spotLight: SpotLight }){
    const { spotLight } = props;
    const { radius, innerAngle, outerAngle } = spotLight;
    const dispatch = useAppDispatch();
    const spotLightClone = cloneDeep(spotLight);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: spotLightClone }));
    }

    return (
        <div className="flex flex-col">
            <OneValueRow
                label="Radius"
                value={radius}
                range={[0, Number.MAX_VALUE]}
                onChange={(value) => {
                    spotLightClone.radius = value;
                    update();
                }}
            />
            <OneValueRow
                label="Inner angle"
                value={innerAngle}
                range={[0, 89]}
                onChange={(value) => {
                    spotLightClone.innerAngle = value;
                    update();
                }}
            />
            <OneValueRow
                label="Out angle"
                value={outerAngle}
                range={[0, 89]}
                onChange={(value) => {
                    spotLightClone.outerAngle = value;
                    update();
                }}
            />
        </div>
    );
}
function CameraSection(props: { camera: Camera }){
    const { camera } = props;
    const dispatch = useAppDispatch();
    const cameraClone = cloneDeep(camera);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: cameraClone }));
    }
    return (
        <div className="flex flex-col">
            <Header label="Camera" component={camera}/>
            <OneValueRow
                label="Fovy"
                value={camera.fovy}
                range={[30, 180]}
                onChange={(value) => {
                    cameraClone.fovy = value;
                    update();
                }}
            />
        </div>
    );
}
function SkyBoxSection(props: { skyBox: SkyBox }){
    const { skyBox } = props;
    const dispatch = useAppDispatch();
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const skyBoxClone = cloneDeep(skyBox);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: skyBoxClone }));
    }

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType("hdr");
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, []);

    return (
        <div className="flex flex-col">
            <Header label="SkyBox" component={skyBox}/>
            <Selection
                label="hdrRef"
                options={
                    assetInfos.map(e => {
                        return {
                            label: e.name,
                            value: e.uuid
                        }
                    })
                }
                value={skyBox.hdrRef}
                onChange={(value) => {
                    skyBoxClone.hdrRef = value;
                    update();
                }}
            />
        </div>
    );
}
function UILayout(props: { uiLayout: UILayout }){
    const { uiLayout } = props;
    const { html, css, js } = uiLayout;
    const dispatch = useAppDispatch();
    const uiLayoutClone = cloneDeep(uiLayout);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: uiLayoutClone }));
    }

    return (
        <div className="flex flex-col gap-1">
            <Header label="UILayout" component={uiLayout}/>
            <TextOrStringSelection
                label="Html"
                textOrString={html}
                onChange={(textOrString) => {
                    uiLayoutClone.html = textOrString;
                    update();
                }}
            />
            <TextOrStringSelection
                label="Css"
                textOrString={css}
                onChange={(textOrString) => {
                    uiLayoutClone.css = textOrString;
                    update();
                }}
            />
            <TextOrStringSelection
                label="Js"
                textOrString={js}
                onChange={(textOrString) => {
                    uiLayoutClone.js = textOrString;
                    update();
                }}
            />
        </div>
    );
}
function Header(props: { label: string, component: Component }){
    const { label, component } = props;
    const dispatch = useAppDispatch();

    const onRightClick = (e: React.MouseEvent) => {
        dispatch(openContextMenu({
            contextMenu: { type: "component", component },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }

    return (
        <div className="flex flex-1 items-center justify-center mb-1 transition hover:opacity-80 cursor-pointer"
            onContextMenu={onRightClick}
        >
            <span className="select-none text-sm text-white font-bold">{label}</span>
            <div className="flex-1 h-0.5 bg-slate-700 ml-2"></div>
        </div>
    );
}

