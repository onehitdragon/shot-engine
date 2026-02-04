import { useState, type JSX } from "react";
import { useAppDispatch } from "../../../../global-state/hooks";
import type { SceneNodeInspector } from "../../../../global-state/slices/inspector-slice";
import { updateComponentOfSceneNode } from "../../../../global-state/slices/scene-manager-slice";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { openContextMenu } from "../../../../global-state/slices/context-menu-slice";
import { clamp } from "@math.gl/core";
import { CheckBox, OneValueRow, Selection } from "./components";

export function SceneNodeInspector(props: { sceneNodeInspector: SceneNodeInspector }){
    const { sceneNodeInspector } = props;
    const { scene, node } = sceneNodeInspector;

    return (
        <div className="flex flex-col gap-3 flex-1 p-1 overflow-auto scrollbar-thin">
            {
                node.components.map((c) => <ComponentSection key={c.id} scene={scene} node={node} component={c}/>)
            }
        </div>
    );
}
function ComponentSection(props: { scene: SceneFormat.Scene, node: SceneFormat.SceneNode, component: Components.Component }){
    const { scene, node, component } = props;
    const { type } = component;
    return (
        type === "Transform" ? <TransformSection node={node} component={component}/> :
        type === "Mesh" ? <MeshSection scene={scene} node={node} component={component}/> :
        type === "Shading" ? <ShadingSection node={node} component={component}/> :
        type === "Light" ? <LightSection node={node} component={component}/> :
        <div>Dont support this component</div>
    );
}
function TransformSection(props: { node: SceneFormat.SceneNode, component: Components.Transform }){
    const { node, component } = props;
    const { position, rotation, scale } = component;
    const dispatch = useAppDispatch();

    return (
        <div className="flex flex-col">
            <Header label="Transform" node={node} component={component}/>
            <div className="flex flex-col">
                <ThreeValueRow
                    label="Position"
                    value={{ x: position[0], y: position[1], z: position[2] }}
                    onChange={(value) => {
                        dispatch(updateComponentOfSceneNode({
                            nodeId: node.id,
                            component: { ...component, position: [value.x, value.y, value.z] }
                        }));
                    }}
                />
                <ThreeValueRow
                    label="Rotation"
                    value={{ x: rotation[0], y: rotation[1], z: rotation[2] }}
                    onChange={(value) => {
                        dispatch(updateComponentOfSceneNode({
                            nodeId: node.id,
                            component: { ...component, rotation: [value.x, value.y, value.z] }
                        }));
                    }}
                />
                <ThreeValueRow
                    label="Scale"
                    value={{ x: scale[0], y: scale[1], z: scale[2] }}
                    onChange={(value) => {
                        dispatch(updateComponentOfSceneNode({
                            nodeId: node.id,
                            component: { ...component, scale: [value.x, value.y, value.z] }
                        }));
                    }}
                />
            </div>
        </div>
    );
}
function MeshSection(props: { scene: SceneFormat.Scene, node: SceneFormat.SceneNode, component: Components.Mesh }){
    const { scene, node, component } = props;
    const { meshes } = scene;
    const { meshId } = component;
    const mesh = meshes.find(m => m.id === meshId);
    const showVertices = () => {
        if(!mesh) return [];
        const vertices = mesh.vertices;
        const result = [];
        for(let i = 0, j = 0; i < vertices.length; i += 3, j++){
            result.push(
                <li key={j} className="flex ml-2">
                    <span className="text-sm text-white">
                        Vertex{j}: ({vertices[i]}, {vertices[i + 1]}, {vertices[i + 2]})
                    </span>
                </li>
            );
        }
        return result;
    }
    const showNormals = () => {
        if(!mesh) return [];
        const normals = mesh.normals;
        const vertexIndices = mesh.vertexIndices;
        const result = [];
        for(let i = 0, j = 0; i < vertexIndices.length; i += 3, j++){
            const index0 = vertexIndices[i];
            const index1 = vertexIndices[i + 1];
            const index2 = vertexIndices[i + 2];
            result.push(
                <li key={j} className="flex ml-2">
                    <span className="text-sm text-white">
                        Trig{j}: ({index0}, {index1}, {index2})
                        [
                            ({normals[index0 * 3]}, {normals[index0 * 3 + 1]}, {normals[index0 * 3 + 2]}),
                            ({normals[index1 * 3]}, {normals[index1 * 3 + 1]}, {normals[index1 * 3 + 2]}),
                            ({normals[index2 * 3]}, {normals[index2 * 3 + 1]}, {normals[index2 * 3 + 2]})
                        ]
                    </span>
                </li>
            );
        }
        return result;
    }
    const showVertexIndices = () => {
        if(!mesh) return [];
        const vertices = mesh.vertices;
        const vertexIndices = mesh.vertexIndices;
        const result = [];
        for(let i = 0, j = 0; i < vertexIndices.length; i += 3, j++){
            const index0 = vertexIndices[i];
            const index1 = vertexIndices[i + 1];
            const index2 = vertexIndices[i + 2];
            result.push(
                <li key={j} className="flex ml-2">
                    <span className="text-sm text-white">
                        Trig{j}: ({index0}, {index1}, {index2})
                        [
                            ({vertices[index0 * 3]}, {vertices[index0 * 3 + 1]}, {vertices[index0 * 3 + 2]}),
                            ({vertices[index1 * 3]}, {vertices[index1 * 3 + 1]}, {vertices[index1 * 3 + 2]}),
                            ({vertices[index2 * 3]}, {vertices[index2 * 3 + 1]}, {vertices[index2 * 3 + 2]})
                        ]
                    </span>
                </li>
            );
        }
        return result;
    }
    
    return (
        <div className="flex flex-col">
            <Header label="Mesh" node={node} component={component}/>
            {
                !mesh ?
                <div className="flex gap-2 mb-1">
                    <span className="select-none text-xs text-white">
                        Mesh {meshId} not found in scene
                    </span>
                </div> :
                <div className="flex gap-2 mb-1">
                    <span className="select-none text-xs text-white">
                        {mesh.vertices.length / 3} Vertices
                    </span>
                    <span className="select-none text-xs text-white">
                        {mesh.normals.length / 3} Normals
                    </span>
                    <span className="select-none text-xs text-white">
                        {mesh.vertexIndices.length / 3} Triangles
                    </span>
                </div>
            }
            <CollapsedList label="Vertices" listGenerator={showVertices}/>
            <CollapsedList label="Normals" listGenerator={showNormals}/>
            <CollapsedList label="Triangles" listGenerator={showVertexIndices}/>
        </div>
    );
}
function ShadingSection(props: { node: SceneFormat.SceneNode, component: Components.Shading }){
    const { node, component } = props;
    const { shaderType, culling, transparent } = component;
    const dispatch = useAppDispatch();
    return (
        <div className="flex flex-col">
            <Header label="Shading" node={node} component={component}/>
            <div className="flex gap-2 mb-1">
                <span className="select-none text-sm text-white">
                    Shader type: {shaderType}
                </span>
            </div>
            <Selection
                label="Culling"
                value={culling}
                options={[
                    { label: "None", value: "none" },
                    { label: "Back", value: "back" },
                    { label: "Front", value: "front" },
                    { label: "Both", value: "both" }
                ]}
                onChange={(value) => {
                    dispatch(updateComponentOfSceneNode({
                        nodeId: node.id,
                        component: { ...component, culling: value }
                    }));
                }}
            />
            <CheckBox
                label="Transparent"
                value={transparent}
                onChange={(value) => {
                    dispatch(updateComponentOfSceneNode({
                        nodeId: node.id,
                        component: { ...component, transparent: value }
                    }));
                }}
            />
            {
                shaderType === "phong" &&
                <PhongShadingEditor node={node} shadingComponent={component}/>
            }
        </div>
    );
}
function PhongShadingEditor(props: {
    node: SceneFormat.SceneNode,
    shadingComponent: Components.PhongShading
}){
    const { node, shadingComponent } = props;
    const { ambient, shininess } = shadingComponent;
    const dispatch = useAppDispatch(); 
    return (
        <div className="flex flex-col">
            <ThreeValueRow
                label="Ambient"
                value={{ x: ambient[0], y: ambient[1], z: ambient[2] }}
                onChange={(value) => {
                    dispatch(updateComponentOfSceneNode({
                        nodeId: node.id,
                        component: { ...shadingComponent, ambient: [value.x, value.y, value.z] }
                    }));
                }}
            />
            <OneValueRow
                label="Shininess"
                value={shininess}
                onChange={(value) => {
                    dispatch(updateComponentOfSceneNode({
                        nodeId: node.id,
                        component: { ...shadingComponent, shininess: value }
                    }));
                }}
            />
        </div>
    );
}
function LightSection(props: {
    node: SceneFormat.SceneNode,
    component: Components.Light
}){
    const { node, component } = props;
    const { lightType } = component;

    return (
        <div className="flex flex-col">
            <Header label={lightType === "PointLight" ? "Point Light" : "Direction Light"}
                node={node} component={component}/>
            {
                lightType === "PointLight" ?
                <PointLightEditor node={node} light={component}/> :
                <DirectionalLightEditor node={node} light={component}/>
            }
        </div>
    );
}
function PointLightEditor(props: {
    node: SceneFormat.SceneNode,
    light: Components.PointLight
}){
    const { node, light } = props;
    const { color } = light;
    const dispatch = useAppDispatch(); 
    return (
        <div className="flex flex-col">
            <RGBValueRow
                label="Color"
                value={{ x: color[0], y: color[1], z: color[2] }}
                onChange={(value) => {
                    dispatch(updateComponentOfSceneNode({
                        nodeId: node.id,
                        component: { ...light, color: [value.x, value.y, value.z] }
                    }));
                }}
            />
        </div>
    );
}
function DirectionalLightEditor(props: {
    node: SceneFormat.SceneNode,
    light: Components.DirectionalLight
}){
    const { node, light } = props;
    const { dir } = light;
    const dispatch = useAppDispatch();
    return (
        <div className="flex flex-col">
            <ThreeValueRow
                label="Direction"
                value={{ x: dir[0], y: dir[1], z: dir[2] }}
                onChange={(value) => {
                    dispatch(updateComponentOfSceneNode({
                        nodeId: node.id,
                        component: { ...light, dir: [value.x, value.y, value.z] }
                    }));
                }}
            />
        </div>
    );
}
function Header(props: { label: string, node: SceneFormat.SceneNode, component: Components.Component }){
    const { label, node, component } = props;
    const dispatch = useAppDispatch();

    const onRightClick = (e: React.MouseEvent) => {
        dispatch(openContextMenu({
            contextMenu: { type: "component", sceneNode: node , component },
            mousePos: { x: e.clientX, y: e.clientY }
        }));
    }

    return (
        <div className="flex flex-1 items-center mb-1 transition hover:opacity-80 cursor-pointer"
            onContextMenu={onRightClick}
        >
            <span className="select-none text-sm text-white font-bold">{label}</span>
        </div>
    );
}
function CollapsedList(props: { label: string, listGenerator: () => JSX.Element[] }){
    const { label, listGenerator } = props;
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="flex flex-col">
            <div className="flex items-center cursor-pointer transition hover:opacity-80"
                onClick={() => setCollapsed(!collapsed)}
            >
                <span className="select-none text-sm text-white">{label}</span>
                <div className="h-0.5 flex-1 bg-gray-600 mx-1"></div>
                {
                    collapsed ?
                    <ChevronRightIcon className="size-4 text-white"/> :
                    <ChevronDownIcon className="size-4 text-white"/>
                }
            </div>
            {
                !collapsed &&
                <ul className="flex flex-col">
                    { listGenerator() }
                </ul>
            }
        </div>
    );
}
function ThreeValueRow(
    props: {
        label: string,
        value: {x: number, y: number, z: number},
        onChange: (value: {x: number, y: number, z: number}) => void
    }
){
    const { label, value, onChange } = props;
    const { x, y, z } = value;
    const [xState, setX] = useState(x.toString());
    const [yState, setY] = useState(y.toString());
    const [zState, setZ] = useState(z.toString());
    const onBlurX = () => {
        setX(stringToNumber(xState).toString());
        onChange({ x: stringToNumber(xState), y, z });
    }
    const onBlurY = () => {
        setY(stringToNumber(yState).toString());
        onChange({ x, y: stringToNumber(yState), z });
    }
    const onBlurZ = () => {
        setZ(stringToNumber(zState).toString());
        onChange({ x, y, z: stringToNumber(zState) });
    }
    const stringToNumber = (s: string) => {
        return Number(s);
    }

    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center justify-evenly w-full gap-1">
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={xState}
                    onBlur={onBlurX}
                    onKeyDown={(e) => e.key === "Enter" && onBlurX()}
                    onChange={(e) => { setX(e.target.value) }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={yState}
                    onBlur={onBlurY}
                    onKeyDown={(e) => e.key === "Enter" && onBlurY()}
                    onChange={(e) => { setY(e.target.value) }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={zState}
                    onBlur={onBlurZ}
                    onKeyDown={(e) => e.key === "Enter" && onBlurZ()}
                    onChange={(e) => { setZ(e.target.value) }}
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
    const { label, value, onChange } = props;
    const { x, y, z } = value;
    const [xState, setX] = useState((x * 255).toString());
    const [yState, setY] = useState((y * 255).toString());
    const [zState, setZ] = useState((z * 255).toString());
    const onBlurX = () => {
        setX(stringToNumber(xState).toString());
        onChange({ x: stringToNumber(xState) / 255, y, z });
    }
    const onBlurY = () => {
        setY(stringToNumber(yState).toString());
        onChange({ x, y: stringToNumber(yState) / 255, z });
    }
    const onBlurZ = () => {
        setZ(stringToNumber(zState).toString());
        onChange({ x, y, z: stringToNumber(zState) / 255 });
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
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={xState}
                    onBlur={onBlurX}
                    onKeyDown={(e) => e.key === "Enter" && onBlurX()}
                    onChange={(e) => { setX(e.target.value) }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={yState}
                    onBlur={onBlurY}
                    onKeyDown={(e) => e.key === "Enter" && onBlurY()}
                    onChange={(e) => { setY(e.target.value) }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={zState}
                    onBlur={onBlurZ}
                    onKeyDown={(e) => e.key === "Enter" && onBlurZ()}
                    onChange={(e) => { setZ(e.target.value) }}
                />
                <div style={{background: `rgb(${x * 255}, ${y * 255}, ${z * 255})`}}
                    className="size-3"></div>
            </div>
        </div>
    );
}

