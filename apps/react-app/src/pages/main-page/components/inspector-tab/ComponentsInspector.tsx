import type { AssetManager, Component, Light, Mesh, PbrShading, PhongShading, PointLight, Shading, Skeleton, SkyBox, SpotLight, Transform, UIBaseElement, UIElement, UILayout, UITextElement } from "@shot-engine/types";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { selectComponents } from "../../../../global-state/slices/inspector-components-slice";
import { cloneDeep } from "lodash";
import { componentUpdatedThunk } from "../../../../global-state/thunks/inspector-components-thunks";
import { ThreeValueRow, RGBValueRow, CheckBox, OneValueRow, Selection, TextRow, ImageOrColorSelection, ImageOrValueSelection, OptionalImageSelection, TextRowErr, CollapsedList, OneInputRow } from "./components";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { quat } from "gl-matrix";
import { getNormalizeColor, getDenormalizeColor } from "../../helpers/utils/utils";
import { selectNodeRecord } from "../../../../global-state/slices/go-tree-slice";
import { ColorToVec3, Vec3ToColor, Vec3ToFixedString, Vec3ToRGBString } from "./helper";

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
                    else if(component.type === "Skeleton"){
                        return <SkeletonSection key={component.id} skeleton={component}/>
                    }
                    else if(component.type === "UILayout"){
                        return <UILayout key={component.id} uiLayout={component}/>
                    }
                    else if(component.type === "UIElement"){
                        return <UIElement key={component.id} uiElement={component}/>
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
    const { diffuse, specular, shininess } = phongShading;
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
            <RGBValueRow
                label="Specular color"
                value={getDenormalizeColor(specular)}
                onChange={(value) => {
                    shadingClone.specular = getNormalizeColor(value);;
                    update();
                }
            }/>
            <OneValueRow
                label="Shininess"
                value={shininess}
                range={[1, Number.MAX_VALUE]}
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
    const { diffuse, metallic, roughness, reflectance, emissive, normal, ao } = pbrShading;
    const dispatch = useAppDispatch();
    
    const shadingClone = cloneDeep(pbrShading);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: shadingClone }));
    }

    return (
        <div className="flex flex-col">
            <ImageOrColorSelection
                label="Diffuse"
                imageOrColor={diffuse}
                onChange={(imageOrColor) => {
                    shadingClone.diffuse = imageOrColor;
                    update();
                }}
            />
            <ImageOrValueSelection
                label="Metallic"
                imageOrValue={metallic}
                onChange={(value) => {
                    shadingClone.metallic = value;
                    update();
                }}
                valueConfig={{
                    default: 0,
                    range: [0, 1]
                }}
            />
            <ImageOrValueSelection
                label="Roughness"
                imageOrValue={roughness}
                onChange={(value) => {
                    shadingClone.roughness = value;
                    update();
                }}
                valueConfig={{
                    default: 1,
                    range: [0, 1]
                }}
            />
            <OneValueRow
                label="Reflectance"
                value={reflectance}
                range={[0, 1]}
                onChange={(value) => {
                    shadingClone.reflectance = value;
                    update();
                }}
            />

            <ImageOrColorSelection
                label="Emissive"
                imageOrColor={emissive.color}
                onChange={(imageOrColor) => {
                    shadingClone.emissive.color = imageOrColor;
                    update();
                }}
            />
            <OneValueRow
                label="Emissive intensity"
                value={emissive.intensity}
                range={[0, Number.MAX_VALUE]}
                onChange={(value) => {
                    shadingClone.emissive.intensity = value;
                    update();
                }}
            />

            <OptionalImageSelection
                label="Normal"
                optionalImage={normal}
                onChange={(value) => {
                    shadingClone.normal = value;
                    update();
                }}
            />
            <OptionalImageSelection
                label="AO"
                optionalImage={ao}
                onChange={(value) => {
                    shadingClone.ao = value;
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
                value={getDenormalizeColor(color)}
                onChange={(value) => {
                    baseLightClone.color = getNormalizeColor(value);
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
function SkeletonSection(props: { skeleton: Skeleton }){
    const { skeleton } = props;
    const nodeRecord = useAppSelector(selectNodeRecord);
    const rootJoint = nodeRecord[skeleton.rootJointId];

    return (
        <div className="flex flex-col">
            <Header label="Skeleton" component={skeleton}/>
            {
                rootJoint ? 
                <TextRow label="root joint" content={`${rootJoint.name} (${skeleton.rootJointId})`}/>:
                <TextRowErr label="root joint" content={`None (${skeleton.rootJointId})`}/>
            }
        </div>
    );
}
function UILayout(props: { uiLayout: UILayout }){
    const { uiLayout } = props;

    return (
        <div className="flex flex-col">
            <Header label="UILayout" component={uiLayout}/>
        </div>
    );
}
function BaseUIElementEditor(props: { uiElement: UIElement }){
    const { uiElement } = props;
    const uiElementClone = cloneDeep(uiElement);
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const dispatch = useAppDispatch();
    const update = () => {
        dispatch(componentUpdatedThunk({ component: uiElementClone }));
    }
    const styles = [
        {
            property: "Choose type"
        },
        {
            property: "flexDirection",
            options: ["Column", "ColumnReverse", "Row", "RowReverse"]
        },
        {
            property: "flex",
            type: "number"
        },
        {
            property: "justifyContent",
            options: ["FlexStart","Center","FlexEnd","SpaceBetween","SpaceAround","SpaceEvenly"]
        },
        {
            property: "alignItems",
            options: [
                "Auto","FlexStart","Center","FlexEnd","Stretch","Baseline","SpaceBetween",
                "SpaceAround","SpaceEvenly"
            ]
        },
        {
            property: "gap",
            type: "number"
        },
        {
            property: "width",
            type: "number"
        },
        {
            property: "height",
            type: "number"
        },
        {
            property: "margin",
            type: "lrtb"
        },
        {
            property: "padding",
            type: "lrtb"
        },
        {
            property: "color",
            type: "color"
        },
        {
            property: "backgroundColor",
            type: "color"
        },
        {
            property: "fontSize",
            type: "number"
        },
        {
            property: "fontRef",
            stringOptions: assetInfos.map(e => {
                return {
                    label: e.name,
                    value: e.uuid
                }
            })
        },
    ];
    const [curStyle, setCurStyle] = useState<typeof styles[0]>(styles[0]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType("font");
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, []);

    function NumberEditor(props: {num?: number}){
        const [state, setState] = useState(props.num ?? 0);
        return <div className="flex gap-2">
            <input className="outline-none border text-sm px-0.5 w-1/3"
                type="number"
                value={state.toString()}
                onChange={(e) => {
                    setState(Number(e.target.value));
                }}
            />
            <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
                onClick={() => {
                    (uiElementClone[curStyle.property as keyof UIBaseElement] as number) = state;
                    update();
                }}>
                Set
            </button>
        </div>
    }
    function OptionEditor(props: {num?: number, options: string[]}){
        const [state, setState] = useState(props.num ?? 0);
        return <div className="flex gap-2">
            <select className="cursor-pointer outline-none text-sm border" 
                value={state}
                onChange={(e) => { setState(Number(e.target.value)); }}
            >
                {
                    props.options.map((opt, index) => {
                        return <option key={opt} value={index}>{opt}</option>
                    })
                }
            </select>
            <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
                onClick={() => {
                    (uiElementClone[curStyle.property as keyof UIBaseElement] as number) = state;
                    update();
                }}>
                Set
            </button>
        </div>
    }
    function LRTBEditor(props: {lrtb: UIElement["margin"]}){
        const [state, setState] = useState(props.lrtb);
        return <div className="flex flex-col items-start gap-2">
            <div className="flex gap-1">
                <input className="outline-none border text-sm px-0.5 w-20"
                    type="number"
                    value={state?.left?.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setState({ ...state, left: v || undefined });
                    }}
                />
                <span>left</span>
            </div>
            <div className="flex gap-1">
                <input className="outline-none border text-sm px-0.5 w-20"
                    type="number"
                    value={state?.right?.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setState({ ...state, right: v || undefined });
                    }}
                />
                <span>right</span>
            </div>
            <div className="flex gap-1">
                <input className="outline-none border text-sm px-0.5 w-20"
                    type="number"
                    value={state?.top?.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setState({ ...state, top: v || undefined });
                    }}
                />
                <span>top</span>
            </div>
            <div className="flex gap-1">
                <input className="outline-none border text-sm px-0.5 w-20"
                    type="number"
                    value={state?.bottom?.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setState({ ...state, bottom: v || undefined });
                    }}
                />
                <span>bottom</span>
            </div>
            <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
                onClick={() => {
                    (uiElementClone[curStyle.property as keyof UIBaseElement] as UIElement["margin"]) = state;
                    update();
                }}>
                Set
            </button>
        </div>
    }
    function ColorEditor(props: {color: UIBaseElement["color"]}){
        const [state, setState] = useState(props.color && Vec3ToColor(props.color));
        return <div className="flex flex-col items-start gap-2">
            <div className="flex gap-1">
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    type="number"
                    value={state?.x.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        if(!state) setState({ x: v, y: 0, z: 0 });
                        else setState({ ...state, x: v });
                    }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    type="number"
                    value={state?.y.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        if(!state) setState({ x: 0, y: v, z: 0 });
                        else setState({ ...state, y: v });
                    }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    type="number"
                    value={state?.z.toString() || 0}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        if(!state) setState({ x: 0, y: 0, z: v });
                        else setState({ ...state, z: v });
                    }}
                />
            </div>

            <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
                onClick={() => {
                    (uiElementClone[curStyle.property as keyof UIBaseElement] as UIElement["color"]) 
                    = state && ColorToVec3(state);
                    update();
                }}>
                Set
            </button>
        </div>
    }
    function StringOptionEditor(props: {cur?: string, options: { label: string, value: string }[]}){
        const [state, setState] = useState(props.cur || "");
        return <div className="flex gap-2">
            <select className="cursor-pointer outline-none text-sm border" 
                value={state}
                onChange={(e) => { setState(e.target.value); }}
            >
                <option value="">Choose font</option>
                {
                    props.options.map((opt) => {
                        return <option key={opt.value} value={opt.value}>{opt.label}</option>
                    })
                }
            </select>
            <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
                onClick={() => {
                    (uiElementClone[curStyle.property as keyof UIBaseElement] as string | undefined)
                     = state || undefined;
                    update();
                }}>
                Set
            </button>
        </div>
    }

    return <div className="flex flex-col">
        <div className="flex flex-col items-start gap-1">
            <select className="cursor-pointer outline-none text-sm border" 
                value={curStyle.property}
                onChange={(e) => {
                    let stype = styles.find((item) => item.property === e.target.value);
                    if(!stype){
                        stype = { property: "Choose type" };
                    }
                    setCurStyle(stype);
                }}
            >
                {
                    styles.map((style) => {
                        return <option key={style.property} value={style.property}>
                            {style.property}
                        </option>
                    })
                }
            </select>
            {
                curStyle.type === "number" && <NumberEditor num={
                    uiElementClone[
                        curStyle.property as keyof UIBaseElement
                    ] as number | undefined
                }/>
            }
            {
                curStyle.options && <OptionEditor 
                    num={
                        uiElementClone[
                            curStyle.property as keyof UIBaseElement
                        ] as number | undefined
                    }
                    options={curStyle.options}
                />
            }
            {
                curStyle.type === "lrtb" && <LRTBEditor lrtb={
                    uiElementClone[
                        curStyle.property as keyof UIBaseElement
                    ] as UIBaseElement["margin"]
                }/>
            }
            {
                curStyle.type === "color" && <ColorEditor color={
                    uiElementClone[
                        curStyle.property as keyof UIBaseElement
                    ] as UIBaseElement["color"]
                }/>
            }
            {
                curStyle.stringOptions && <StringOptionEditor
                    cur={
                        uiElementClone[
                            curStyle.property as keyof UIBaseElement
                        ] as UIBaseElement["fontRef"]
                    }
                    options={curStyle.stringOptions}
                />
            }
        </div>
        <CollapsedList label="Style"
            listGenerator={() => {
                return styles.map((style) => {
                    if(style.type === "number"){
                        const number = uiElementClone[
                            style.property as keyof UIBaseElement
                        ] as number | undefined;
                        if(number !== undefined){
                            return <div key={style.property} className="flex justify-between">
                                <span className="select-none">{style.property}: {number}</span>
                                <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                                    transition select-none cursor-pointer rounded"
                                    onClick={() => {
                                        (uiElementClone[style.property as keyof UIBaseElement] as number | undefined)
                                         = undefined;
                                        update();
                                    }}>
                                    Remove
                                </button>
                            </div>
                        }
                    }
                    if(style.options){
                         const number = uiElementClone[
                            style.property as keyof UIBaseElement
                        ] as number | undefined;
                        if(number !== undefined){
                            return <div key={style.property} className="flex justify-between">
                                <span className="select-none">
                                    {style.property}: {style.options[number]}
                                </span>
                                <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                                    transition select-none cursor-pointer rounded"
                                    onClick={() => {
                                        (uiElementClone[style.property as keyof UIBaseElement] as number | undefined)
                                         = undefined;
                                        update();
                                    }}>
                                    Remove
                                </button>
                            </div>
                        }
                    }
                    if(style.type === "lrtb"){
                        const lrtb = uiElementClone[
                            style.property as keyof UIBaseElement
                        ] as UIBaseElement["margin"];
                        if(lrtb !== undefined){
                            return <div key={style.property} className="flex justify-between">
                                <span className="select-none">
                                    {style.property}: {lrtb.left ?? 0}L {lrtb.right ?? 0}R {lrtb.top ?? 0}T {lrtb.bottom ?? 0}B
                                </span>
                                <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                                    transition select-none cursor-pointer rounded"
                                    onClick={() => {
                                        (uiElementClone[style.property as keyof UIBaseElement] as number | undefined)
                                         = undefined;
                                        update();
                                    }}>
                                    Remove
                                </button>
                            </div>
                        }
                    }
                    if(style.type === "color"){
                        const color = uiElementClone[
                            style.property as keyof UIBaseElement
                        ] as UIBaseElement["color"];
                        if(color !== undefined){
                            return <div key={style.property} className="flex justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="select-none">
                                        {style.property}: {Vec3ToFixedString(color)}
                                    </span>
                                    <div style={{ background: `${Vec3ToRGBString(color)}` }}
                                        className="size-3"></div>
                                </div>
                                <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                                    transition select-none cursor-pointer rounded"
                                    onClick={() => {
                                        (uiElementClone[style.property as keyof UIBaseElement] as number | undefined)
                                         = undefined;
                                        update();
                                    }}>
                                    Remove
                                </button>
                            </div>
                        }
                    }
                    if(style.stringOptions){
                         const string = uiElementClone[
                            style.property as keyof UIBaseElement
                        ] as string | undefined;
                        if(string !== undefined){
                            const option = style.stringOptions.find(v => v.value === string);
                            return <div key={style.property} className="flex justify-between">
                                <span className="select-none">
                                    {style.property}: {option?.label}
                                </span>
                                <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                                    transition select-none cursor-pointer rounded"
                                    onClick={() => {
                                        (uiElementClone[style.property as keyof UIBaseElement] as string | undefined)
                                         = undefined;
                                        update();
                                    }}>
                                    Remove
                                </button>
                            </div>
                        }
                    }
                    
                })
            }}
        />
    </div>
}
function UITextElementEditor(props: { uiTextElement: UITextElement }){
    const { uiTextElement } = props;
    const { content } = uiTextElement;
    const dispatch = useAppDispatch();
    const uiTextElementClone = cloneDeep(uiTextElement);
    const update = () => {
        dispatch(componentUpdatedThunk({ component: uiTextElementClone }));
    }

    return <div className="flex flex-col">
        <OneInputRow
            label="Text content"
            value={content}
            onChange={(value) => {
                uiTextElementClone.content = value;
                update();
            }}
        />
    </div>
}

function UIElement(props: { uiElement: UIElement }){
    const { uiElement } = props;

    return (
        <div className="flex flex-col">
            <Header label={"UIElement" + uiElement.elementType} component={uiElement}/>
            <BaseUIElementEditor uiElement={uiElement}/>
            { uiElement.elementType === "Text" && <UITextElementEditor uiTextElement={uiElement}/> }
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

