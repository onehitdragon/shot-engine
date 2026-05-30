import type { AssetManager, Component, DirectionalLight, Light, Mesh, PbrShading, PhongShading, PointLight, Shading, SkyBox, Transform } from "@shot-engine/types";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { selectComponents } from "../../../../global-state/slices/inspector-components-slice";
import { cloneDeep } from "lodash";
import { componentUpdatedThunk } from "../../../../global-state/thunks/inspector-components-thunks";
import { CheckBox, OneValueRow, Selection, TextRow } from "./components";
import { clamp } from "@math.gl/core";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { quat } from "gl-matrix";
import { getNormalizeColor, getDenormalizeColor } from "../../helpers/utils/utils";

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
                    else if(component.type === "Mesh"){
                        return <MeshSection key={component.id} mesh={component}/>;
                    }
                    else if(component.type === "Shading"){
                        return <ShadingSection key={component.id} shading={component}/>
                    }
                    else if(component.type === "Light"){
                        return <LightSection key={component.id} light={component}/>
                    }
                    else if(component.type === "SkyBox"){
                        return <SkyBoxSection key={component.id} skyBox={component}/>
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
                    value={transform.pos}
                    onChange={(value) => {
                        transformClone.pos = value;
                        update();
                    }}
                />
                <ThreeValueRow
                    label="Rotation"
                    value={transform.editor.euler}
                    onChange={(value) => {
                        const q = quat.create();
                        quat.fromEuler(q, value.x, value.y, value.z, "yxz");
                        transformClone.editor.euler = value;
                        transformClone.rot = { x: q[0], y: q[1], z: q[2], w: q[3] };
                        update();
                    }}
                />
                <ThreeValueRow
                    label="Scale"
                    value={transform.scale}
                    onChange={(value) => {
                        transformClone.scale = value;
                        update();
                    }}
                />
            </div>
        </div>
    );
}
function MeshSection(props: { mesh: Mesh }){
    const { mesh } = props;
    const [assetInfo, setAssetInfo] = useState<AssetManager.AssetInfo>();
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfo = await window.api.assetManager.getAssetInfoFromUuid(mesh.meshRef);
            if(cancelled) return;
            setAssetInfo(assetInfo);
        }
        load();

        return () => {
            cancelled = true;
        }
    }, [mesh.meshRef]);
    
    return (
        <div className="flex flex-col gap-2">
            <Header label="Mesh" component={mesh}/>
            <TextRow label="ref" content={mesh.meshRef}/>
            {
                assetInfo &&
                <TextRow label="name" content={assetInfo.name}/>
            }
        </div>
    );
}
function ShadingSection(props: { shading: Shading }){
    const { shading } = props;
    const dispatch = useAppDispatch();
    const shadingClone = cloneDeep(shading);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: shadingClone }));
    }

    return (
        <div className="flex flex-col">
            <Header label="Shading" component={shading}/>
            <div className="flex gap-2 mb-1">
                <span className="select-none text-sm text-white">
                    Shader type: {shading.shaderType}
                </span>
            </div>
            <Selection
                label="Culling"
                value={shading.culling}
                options={[
                    { label: "None", value: "none" },
                    { label: "Back", value: "back" },
                    { label: "Front", value: "front" },
                    { label: "Both", value: "both" }
                ]}
                onChange={(value) => {
                    shadingClone.culling = value;
                    update();
                }}
            />
            <CheckBox
                label="Transparent"
                value={shading.transparent}
                onChange={(value) => {
                    shadingClone.transparent = value;
                    update();
                }}
            />
            {
                shading.shaderType === "phong" &&
                <PhongShadingEditor phongShading={shading}/>
            }
            {
                shading.shaderType === "pbr" &&
                <PbrShadingEditor pbrShading={shading}/>
            }
        </div>
    );
}
function PhongShadingEditor(props: { phongShading: PhongShading }){
    const { phongShading } = props;
    const { diffuse, ambient, shininess } = phongShading;
    const dispatch = useAppDispatch();
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const shadingClone = cloneDeep(phongShading);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: shadingClone }));
    }
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if(diffuse.type === "color") setAssetInfos([]);
            else{
                const assetInfos = await window.api.assetManager.getAssetInfosFromType("image");
                if(cancelled) return;
                setAssetInfos(assetInfos);
            }
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [diffuse.type]);

    return (
        <div className="flex flex-col">
            <Selection
                label="Diffuse"
                options={[
                    { label: "image", value: "image" },
                    { label: "color", value: "color" },
                ]}
                value={diffuse.type}
                onChange={(value) => {
                    shadingClone.diffuse.type = value;
                    if(shadingClone.diffuse.type === "color"){
                        shadingClone.diffuse.color = { x: 1, y: 1, z: 1 };
                    }
                    if(shadingClone.diffuse.type === "image"){
                        shadingClone.diffuse.imageRef = "";
                    }
                    update();
                }}
            />
            {
                diffuse.type === "color" &&
                <RGBValueRow
                    label="Color"
                    value={getDenormalizeColor(diffuse.color)}
                    onChange={(value) => {
                    if(shadingClone.diffuse.type === "color"){
                        shadingClone.diffuse.color = getNormalizeColor(value);;
                        update();
                    }
                }}/>
            }
            {
                diffuse.type === "image" &&
                <Selection
                    label="imageRef"
                    options={
                        assetInfos.map(e => {
                            return {
                                label: e.name,
                                value: e.uuid
                            }
                        })
                    }
                    value={diffuse.imageRef}
                    onChange={(value) => {
                        if(shadingClone.diffuse.type === "image"){
                            console.log("change", shadingClone.diffuse.imageRef, "->",  value);
                            shadingClone.diffuse.imageRef = value;
                            update();
                        }
                    }}
                />
            }
            <ThreeValueRow
                label="Ambient"
                value={ambient}
                onChange={(value) => {
                    shadingClone.ambient = value;
                    update();
                }}
            />
            <OneValueRow
                label="Shininess"
                value={shininess}
                onChange={(value) => {
                    shadingClone.shininess = value;
                    update();
                }}
            />
        </div>
    );
}
function PbrShadingEditor(props: { pbrShading: PbrShading }){
    const { pbrShading } = props;
    const { diffuse, metallic, roughness } = pbrShading;
    const dispatch = useAppDispatch();
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const shadingClone = cloneDeep(pbrShading);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: shadingClone }));
    }
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if(diffuse.type === "color") setAssetInfos([]);
            else{
                const assetInfos = await window.api.assetManager.getAssetInfosFromType("image");
                if(cancelled) return;
                setAssetInfos(assetInfos);
            }
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [diffuse.type]);

    return (
        <div className="flex flex-col">
            <Selection
                label="Diffuse"
                options={[
                    { label: "image", value: "image" },
                    { label: "color", value: "color" },
                ]}
                value={diffuse.type}
                onChange={(value) => {
                    shadingClone.diffuse.type = value;
                    if(shadingClone.diffuse.type === "color"){
                        shadingClone.diffuse.color = { x: 1, y: 1, z: 1 };
                    }
                    if(shadingClone.diffuse.type === "image"){
                        shadingClone.diffuse.imageRef = "";
                    }
                    update();
                }}
            />
            {
                diffuse.type === "color" &&
                <RGBValueRow
                    label="Color"
                    value={getDenormalizeColor(diffuse.color)}
                    onChange={(value) => {
                    if(shadingClone.diffuse.type === "color"){
                        shadingClone.diffuse.color = getNormalizeColor(value);;
                        update();
                    }
                }}/>
            }
            {
                diffuse.type === "image" &&
                <Selection
                    label="imageRef"
                    options={
                        assetInfos.map(e => {
                            return {
                                label: e.name,
                                value: e.uuid
                            }
                        })
                    }
                    value={diffuse.imageRef}
                    onChange={(value) => {
                        if(shadingClone.diffuse.type === "image"){
                            console.log("change", shadingClone.diffuse.imageRef, "->",  value);
                            shadingClone.diffuse.imageRef = value;
                            update();
                        }
                    }}
                />
            }
            <OneValueRow
                label="Metallic"
                value={metallic}
                range={[0, 1]}
                onChange={(value) => {
                    shadingClone.metallic = value;
                    update();
                }}
            />
            <OneValueRow
                label="Roughness"
                value={roughness}
                range={[0.01, 1]}
                onChange={(value) => {
                    shadingClone.roughness = value;
                    update();
                }}
            />
        </div>
    );
}
function LightSection(props: { light: Light }){
    const { light } = props;

    return (
        <div className="flex flex-col">
            <Header label={light.lightType === "PointLight" ? "Point Light" : "Direction Light"}
                component={light}/>
            {
                light.lightType === "PointLight" ?
                <PointLightEditor pointLight={light}/> :
                <DirectionalLightEditor dirLight={light}/>
            }
        </div>
    );
}
function PointLightEditor(props: { pointLight: PointLight }){
    const { pointLight } = props;
    const { color, intensity, radius } = pointLight;
    const dispatch = useAppDispatch();
    const pointLightClone = cloneDeep(pointLight);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: pointLightClone }));
    }

    return (
        <div className="flex flex-col">
            <RGBValueRow
                label="Color"
                value={getDenormalizeColor(color)}
                onChange={(value) => {
                    pointLightClone.color = getNormalizeColor(value);
                    update();
                }}
            />
            <OneValueRow
                label="Intensity"
                value={intensity}
                range={[0, Number.MAX_VALUE]}
                onChange={(value) => {
                    pointLightClone.intensity = value;
                    update();
                }}
            />
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
function DirectionalLightEditor(props: { dirLight: DirectionalLight }){
    const { dirLight } = props;
    const { dir } = dirLight;
    const dispatch = useAppDispatch();
    const pointLightClone = cloneDeep(dirLight);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: pointLightClone }));
    }

    return (
        <div className="flex flex-col">
            <ThreeValueRow
                label="Direction"
                value={dir}
                onChange={(value) => {
                    pointLightClone.dir = value;
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
function ThreeValueRow(
    props: {
        label: string,
        value: {x: number, y: number, z: number},
        onChange: (value: {x: number, y: number, z: number}) => void,
    }
){
    const { label, value } = props;
    const { x, y, z } = value;
    const inputXRef = useRef<HTMLInputElement>(null);
    const inputYRef = useRef<HTMLInputElement>(null);
    const inputZRef = useRef<HTMLInputElement>(null);
    const onBlurX = () => {
        const valueX = Number(inputXRef.current?.value ?? "0");
        props.onChange({ x: valueX, y, z });
    }
    const onBlurY = () => {
        const valueY = Number(inputYRef.current?.value ?? "0");
        props.onChange({ x, y: valueY, z });
    }
    const onBlurZ = () => {
        const valueZ = Number(inputZRef.current?.value ?? "0");
        props.onChange({ x, y, z: valueZ });
    }

    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center justify-evenly w-full gap-1">
                <input ref={inputXRef} className="outline-none border text-sm px-0.5 w-1/3"
                    type="number" defaultValue={x}
                    onBlur={onBlurX}
                    onKeyDown={(e) => e.key === "Enter" && onBlurX()}
                />
                <input ref={inputYRef} className="outline-none border text-sm px-0.5 w-1/3"
                    type="number" defaultValue={y}
                    onBlur={onBlurY}
                    onKeyDown={(e) => e.key === "Enter" && onBlurY()}
                />
                <input ref={inputZRef} className="outline-none border text-sm px-0.5 w-1/3"
                    type="number" defaultValue={z}
                    onBlur={onBlurZ}
                    onKeyDown={(e) => e.key === "Enter" && onBlurZ()}
                />
            </div>
        </div>
    );
}
function RGBValueRow(
    props: {
        label: string,
        value: {x: number, y: number, z: number},
        onChange: (value: {x: number, y: number, z: number}) => void
    }
){
    const { label, value } = props;
    const { x, y, z } = value;
    const inputXRef = useRef<HTMLInputElement>(null);
    const inputYRef = useRef<HTMLInputElement>(null);
    const inputZRef = useRef<HTMLInputElement>(null);
    const onBlurX = () => {
        const valueX = stringToNumber(inputXRef.current?.value ?? "0");
        props.onChange({ x: valueX, y, z });
        if(inputXRef.current) inputXRef.current.value = valueX + "";
    }
    const onBlurY = () => {
        const valueY = stringToNumber(inputYRef.current?.value ?? "0");
        props.onChange({ x, y: valueY, z });
        if(inputYRef.current) inputYRef.current.value = valueY + "";
    }
    const onBlurZ = () => {
        const valueZ = stringToNumber(inputZRef.current?.value ?? "0");
        props.onChange({ x, y, z: valueZ });
        if(inputZRef.current) inputZRef.current.value = valueZ + "";
    }
    const stringToNumber = (s: string) => {
        let num = Number(s);
        num = clamp(num, 0, 255);
        return num;
    }

    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center justify-evenly w-full gap-1">
                <input ref={inputXRef}
                    className="outline-none border text-sm px-0.5 w-1/3" type="number"
                    defaultValue={x}
                    onBlur={onBlurX}
                    onKeyDown={(e) => e.key === "Enter" && onBlurX()}
                />
                <input ref={inputYRef}
                    className="outline-none border text-sm px-0.5 w-1/3" type="number"
                    defaultValue={y}
                    onBlur={onBlurY}
                    onKeyDown={(e) => e.key === "Enter" && onBlurY()}
                />
                <input ref={inputZRef}
                    className="outline-none border text-sm px-0.5 w-1/3" type="number"
                    defaultValue={z}
                    onBlur={onBlurZ}
                    onKeyDown={(e) => e.key === "Enter" && onBlurZ()}
                />
                <div style={{background: `rgb(${x * 255}, ${y * 255}, ${z * 255})`}}
                    className="size-3"></div>
            </div>
        </div>
    );
}
