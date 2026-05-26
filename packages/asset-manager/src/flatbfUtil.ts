import type * as ShotEngineType from "@shot-engine/types";
import {
    Vec3, Vec4,
    SceneNode, GameObject, GameObjectPrefab, Component, Transform, Mesh,
    SimpleShading, PhongShading, ImageDiffuse, ColorDiffuse,
    Diffuse, PointLight, DirectionalLight,
    TransformEditor,
    PbrShading
} from "../fbs-gen/fbsengine";
import { Builder, Offset } from "flatbuffers";

export function buildSceneNode(builder: Builder, sceneNode: ShotEngineType.SceneNode): Offset{
    if("prefabRef" in sceneNode){
        const goPrefab = sceneNode;
        const idOffset = builder.createString(goPrefab.id);
        const prefabRefOffset = builder.createString(goPrefab.prefabRef);
        GameObjectPrefab.startGameObjectPrefab(builder);
        GameObjectPrefab.addId(builder, idOffset);
        GameObjectPrefab.addPrefabRef(builder, prefabRefOffset);
        const goPrefabOffset = GameObjectPrefab.endGameObjectPrefab(builder);
        return goPrefabOffset;
    }
    const go = sceneNode;
    const childOffsets: Offset[] = [];
    const childTypeOffsets: SceneNode[] = [];
    for(const child of go.childs){
        const sceneNodeOffset = buildSceneNode(builder, child);
        if("prefabRef" in child){
            childTypeOffsets.push(SceneNode.GameObjectPrefab);
        }
        else{
            childTypeOffsets.push(SceneNode.GameObject);
        }
        childOffsets.push(sceneNodeOffset);
    }
    const componentOffsets: Offset[] = [];
    const componentTypeOffsets: Component[] = [];
    for(const component of go.components){
        let componentOffset: number | undefined;
        if(component.type === "Transform"){
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.pos.x);
            Vec3.addY(builder, component.pos.y);
            Vec3.addZ(builder, component.pos.z);
            const posOffset = Vec3.endVec3(builder);
            Vec4.startVec4(builder);
            Vec4.addX(builder, component.rot.x);
            Vec4.addY(builder, component.rot.y);
            Vec4.addZ(builder, component.rot.z);
            Vec4.addW(builder, component.rot.w);
            const rotOffset = Vec4.endVec4(builder);
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.scale.x);
            Vec3.addY(builder, component.scale.y);
            Vec3.addZ(builder, component.scale.z);
            const scaleOffset = Vec3.endVec3(builder);

            Vec3.startVec3(builder);
            Vec3.addX(builder, component.editor.euler.x);
            Vec3.addY(builder, component.editor.euler.y);
            Vec3.addZ(builder, component.editor.euler.z);
            const eulerOffset = Vec3.endVec3(builder);
            TransformEditor.startTransformEditor(builder);
            TransformEditor.addEuler(builder, eulerOffset);
            const editorOffset = TransformEditor.endTransformEditor(builder);

            const idOffset = builder.createString(component.id);
            Transform.startTransform(builder);
            Transform.addId(builder, idOffset);
            Transform.addPos(builder, posOffset);
            Transform.addRot(builder, rotOffset);
            Transform.addScale(builder, scaleOffset);
            Transform.addEditor(builder, editorOffset);
            componentOffset = Transform.endTransform(builder);
            componentTypeOffsets.push(Component.Transform);
        }
        else if(component.type === "Mesh"){
            const idOffset = builder.createString(component.id);
            const meshRefOffset = builder.createString(component.meshRef);
            Mesh.startMesh(builder);
            Mesh.addId(builder, idOffset);
            Mesh.addMeshRef(builder, meshRefOffset);
            componentOffset = Mesh.endMesh(builder);
            componentTypeOffsets.push(Component.Mesh);
        }
        else if(component.type === "Shading" && component.shaderType === "simple"){
            const idOffset = builder.createString(component.id);
            const cullingOffset = builder.createString(component.culling);
            SimpleShading.startSimpleShading(builder);
            SimpleShading.addId(builder, idOffset);
            SimpleShading.addCulling(builder, cullingOffset);
            SimpleShading.addTransparent(builder, component.transparent);
            componentOffset = SimpleShading.endSimpleShading(builder);
            componentTypeOffsets.push(Component.SimpleShading);
        }
        else if(component.type === "Shading" && component.shaderType === "phong"){
            const idOffset = builder.createString(component.id);
            const cullingOffset = builder.createString(component.culling);
            let diffuseOffset: number;
            let diffuseType: Diffuse;
            if(component.diffuse.type === "image"){
                const imageRefOffset = builder.createString(component.diffuse.imageRef);
                ImageDiffuse.startImageDiffuse(builder);
                ImageDiffuse.addImageRef(builder, imageRefOffset);
                diffuseOffset = ImageDiffuse.endImageDiffuse(builder);
                diffuseType = Diffuse.ImageDiffuse;
            }
            else{
                Vec3.startVec3(builder);
                Vec3.addX(builder, component.diffuse.color.x);
                Vec3.addY(builder, component.diffuse.color.y);
                Vec3.addZ(builder, component.diffuse.color.z);
                const colorOffset = Vec3.endVec3(builder);
                ColorDiffuse.startColorDiffuse(builder);
                ColorDiffuse.addColor(builder, colorOffset);
                diffuseOffset = ColorDiffuse.endColorDiffuse(builder);
                diffuseType = Diffuse.ColorDiffuse;
            }
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.ambient.x);
            Vec3.addY(builder, component.ambient.y);
            Vec3.addZ(builder, component.ambient.z);
            const ambientOffset = Vec3.endVec3(builder);
            PhongShading.startPhongShading(builder);
            PhongShading.addId(builder, idOffset);
            PhongShading.addCulling(builder, cullingOffset);
            PhongShading.addTransparent(builder, component.transparent);
            PhongShading.addDiffuse(builder, diffuseOffset);
            PhongShading.addDiffuseType(builder, diffuseType);
            PhongShading.addAmbient(builder, ambientOffset);
            PhongShading.addShininess(builder, component.shininess);
            componentOffset = PhongShading.endPhongShading(builder);
            componentTypeOffsets.push(Component.PhongShading);
        }
        else if(component.type === "Shading" && component.shaderType === "pbr"){
            const idOffset = builder.createString(component.id);
            const cullingOffset = builder.createString(component.culling);
            let diffuseOffset: number;
            let diffuseType: Diffuse;
            if(component.diffuse.type === "image"){
                const imageRefOffset = builder.createString(component.diffuse.imageRef);
                ImageDiffuse.startImageDiffuse(builder);
                ImageDiffuse.addImageRef(builder, imageRefOffset);
                diffuseOffset = ImageDiffuse.endImageDiffuse(builder);
                diffuseType = Diffuse.ImageDiffuse;
            }
            else{
                Vec3.startVec3(builder);
                Vec3.addX(builder, component.diffuse.color.x);
                Vec3.addY(builder, component.diffuse.color.y);
                Vec3.addZ(builder, component.diffuse.color.z);
                const colorOffset = Vec3.endVec3(builder);
                ColorDiffuse.startColorDiffuse(builder);
                ColorDiffuse.addColor(builder, colorOffset);
                diffuseOffset = ColorDiffuse.endColorDiffuse(builder);
                diffuseType = Diffuse.ColorDiffuse;
            }
            PbrShading.startPbrShading(builder);
            PbrShading.addId(builder, idOffset);
            PbrShading.addCulling(builder, cullingOffset);
            PbrShading.addTransparent(builder, component.transparent);
            PbrShading.addDiffuse(builder, diffuseOffset);
            PbrShading.addDiffuseType(builder, diffuseType);
            PbrShading.addMetallic(builder, component.metallic);
            PbrShading.addRoughness(builder, component.roughness);
            componentOffset = PbrShading.endPbrShading(builder);
            componentTypeOffsets.push(Component.PbrShading);
        }
        else if(component.type === "Light" && component.lightType === "PointLight"){
            const idOffset = builder.createString(component.id);
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.color.x);
            Vec3.addY(builder, component.color.y);
            Vec3.addZ(builder, component.color.z);
            const colorOffset = Vec3.endVec3(builder);
            PointLight.startPointLight(builder);
            PointLight.addId(builder, idOffset);
            PointLight.addColor(builder, colorOffset);
            PointLight.addIntensity(builder, component.intensity);
            PointLight.addRadius(builder, component.radius);
            componentOffset = PointLight.endPointLight(builder);
            componentTypeOffsets.push(Component.PointLight);
        }
        else if(component.type === "Light" && component.lightType === "DirectionalLight"){
            const idOffset = builder.createString(component.id);
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.dir.x);
            Vec3.addY(builder, component.dir.y);
            Vec3.addZ(builder, component.dir.z);
            const dirOffset = Vec3.endVec3(builder);
            DirectionalLight.startDirectionalLight(builder);
            DirectionalLight.addId(builder, idOffset);
            DirectionalLight.addDir(builder, dirOffset);
            DirectionalLight.addIntensity(builder, component.intensity);
            DirectionalLight.addRadius(builder, component.radius);
            componentOffset = DirectionalLight.endDirectionalLight(builder);
            componentTypeOffsets.push(Component.DirectionalLight);
        }
        if(componentOffset !== undefined){
            componentOffsets.push(componentOffset);
        }
    }
    const idOffset = builder.createString(go.id);
    const nameOffset = builder.createString(go.name);
    const componentsOffset = GameObject.createComponentsVector(builder, componentOffsets);
    const componentTypesOffset = GameObject.createComponentsTypeVector(builder, componentTypeOffsets);
    const childsOffset = GameObject.createChildsVector(builder, childOffsets);
    const childTypesOffset = GameObject.createChildsTypeVector(builder, childTypeOffsets);
    GameObject.startGameObject(builder);
    GameObject.addId(builder, idOffset);
    GameObject.addName(builder, nameOffset);
    GameObject.addComponents(builder, componentsOffset);
    GameObject.addComponentsType(builder, componentTypesOffset);
    GameObject.addChilds(builder, childsOffset);
    GameObject.addChildsType(builder, childTypesOffset);
    const goOffset = GameObject.endGameObject(builder);
    return goOffset;
}

export function readGameObject(gameObject: GameObject){
    const gameObjectResult: ShotEngineType.GameObject = {
        id: gameObject.id() ?? "",
        name: gameObject.name() ?? "",
        components: [],
        childs: []
    }
    
    for(let i = 0; i < gameObject.componentsLength(); i++){
        const componentType = gameObject.componentsType(i);
        if(componentType === Component.Transform){
            const transform = gameObject.components(i, new Transform()) as Transform;
            const pos = transform.pos() as Vec3;
            const rot = transform.rot() as Vec4;
            const scale = transform.scale() as Vec3;
            gameObjectResult.components.push({
                type: "Transform",
                id: transform.id() ?? "",
                pos: { x: pos.x(), y: pos.y(), z: pos.z() },
                rot: { x: rot.x(), y: rot.y(), z: rot.z(), w: rot.w() },
                scale: { x: scale.x(), y: scale.y(), z: scale.z() },
                editor: {
                    euler: getVec3(transform.editor()?.euler())
                }
            });
        }
        if(componentType === Component.Mesh){
            const mesh = gameObject.components(i, new Mesh()) as Mesh;
            gameObjectResult.components.push({
                type: "Mesh",
                id: mesh.id() ?? "",
                meshRef: mesh.meshRef() ?? ""
            });
        }
        if(componentType === Component.SimpleShading){
            const simpleShading = gameObject.components(i, new SimpleShading()) as SimpleShading;
            gameObjectResult.components.push({
                type: "Shading",
                shaderType: "simple",
                id: simpleShading.id() ?? "",
                culling: getCulling(simpleShading.culling()),
                transparent: simpleShading.transparent()
            });
        }
        if(componentType === Component.PhongShading){
            const phongShading = gameObject.components(i, new PhongShading()) as PhongShading;
            const diffuseType = phongShading.diffuseType();
            let diffuse: ImageDiffuse | ColorDiffuse;
            let diffuseOut: ShotEngineType.PhongShading["diffuse"];
            if(diffuseType === Diffuse.ImageDiffuse){
                diffuse = phongShading.diffuse(new ImageDiffuse()) as ImageDiffuse;
                diffuseOut = {
                    type: "image",
                    imageRef: diffuse.imageRef() ?? ""
                }
            }
            else{
                diffuse = phongShading.diffuse(new ColorDiffuse()) as ColorDiffuse;
                diffuseOut = {
                    type: "color",
                    color: getVec3(diffuse.color())
                }
            }
            gameObjectResult.components.push({
                type: "Shading",
                shaderType: "phong",
                id: phongShading.id() ?? "",
                culling: getCulling(phongShading.culling()),
                transparent: phongShading.transparent(),
                diffuse: diffuseOut,
                ambient: getVec3(phongShading.ambient()),
                shininess: phongShading.shininess(),
            });
        }
        if(componentType === Component.PbrShading){
            const pbrShading = gameObject.components(i, new PbrShading()) as PbrShading;
            const diffuseType = pbrShading.diffuseType();
            let diffuse: ImageDiffuse | ColorDiffuse;
            let diffuseOut: ShotEngineType.PhongShading["diffuse"];
            if(diffuseType === Diffuse.ImageDiffuse){
                diffuse = pbrShading.diffuse(new ImageDiffuse()) as ImageDiffuse;
                diffuseOut = {
                    type: "image",
                    imageRef: diffuse.imageRef() ?? ""
                }
            }
            else{
                diffuse = pbrShading.diffuse(new ColorDiffuse()) as ColorDiffuse;
                diffuseOut = {
                    type: "color",
                    color: getVec3(diffuse.color())
                }
            }
            gameObjectResult.components.push({
                type: "Shading",
                shaderType: "pbr",
                id: pbrShading.id() ?? "",
                culling: getCulling(pbrShading.culling()),
                transparent: pbrShading.transparent(),
                diffuse: diffuseOut,
                metallic: pbrShading.metallic(),
                roughness: pbrShading.roughness(),
            });
        }
        if(componentType === Component.PointLight){
            const pointLight = gameObject.components(i, new PointLight()) as PointLight;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "PointLight",
                id: pointLight.id() ?? "",
                color: getVec3(pointLight.color()),
                intensity: pointLight.intensity(),
                radius: pointLight.radius()
            });
        }
        if(componentType === Component.DirectionalLight){
            const directionalLight = gameObject.components(i, new DirectionalLight()) as DirectionalLight;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "DirectionalLight",
                id: directionalLight.id() ?? "",
                dir: getVec3(directionalLight.dir()),
                intensity: directionalLight.intensity(),
                radius: directionalLight.radius()
            });
        }
    }

    for(let i = 0; i < gameObject.childsLength(); i++){
        const childType = gameObject.childsType(i);
        if(childType === SceneNode.GameObject){
            const go = gameObject.childs(i, new GameObject()) as GameObject;
            gameObjectResult.childs.push(readGameObject(go));
        }
        if(childType === SceneNode.GameObjectPrefab){
            const goPrefab = gameObject.childs(i, new GameObjectPrefab()) as GameObjectPrefab;
            gameObjectResult.childs.push({
                id: goPrefab.id() ?? "",
                prefabRef: goPrefab.prefabRef() ?? ""
            });
        }
    }

    return gameObjectResult;
}

type CullingType = ShotEngineType.Shading["culling"];
const CULLINGS = new Set<CullingType>(["none", "back", "front", "both"]);
export function getCulling(culling?: string | null){
    if(typeof culling === "string" && CULLINGS.has(culling as CullingType)){
        return culling as CullingType;
    }
    return "none";
}
export function getVec3(vec3?: Vec3 | null): ShotEngineType.Vec3{
    if(!vec3) return { x: 0, y: 0, z: 0 };
    return {
        x: vec3.x(),
        y: vec3.y(),
        z: vec3.z()
    }
}
