import type * as ShotEngineType from "@shot-engine/types";
import {
    Vec3, Vec4,
    SceneNode, GameObject, GameObjectPrefab, Component, Transform, Mesh,
    SimpleShading, PhongShading, PointLight, DirectionalLight,
    TransformEditor,
    PbrShading,
    SkyBox,
    SpotLight,
    ImageOrColor,
    Image,
    Color,
    Value,
    ImageOrValue,
    OptionalImage,
    None,
    Emissive
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
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.color.x);
            Vec3.addY(builder, component.color.y);
            Vec3.addZ(builder, component.color.z);
            const colorOffset = Vec3.endVec3(builder);
            SimpleShading.startSimpleShading(builder);
            SimpleShading.addId(builder, idOffset);
            SimpleShading.addCulling(builder, cullingOffset);
            SimpleShading.addTransparent(builder, component.transparent);
            SimpleShading.addColor(builder, colorOffset);
            componentOffset = SimpleShading.endSimpleShading(builder);
            componentTypeOffsets.push(Component.SimpleShading);
        }
        else if(component.type === "Shading" && component.shaderType === "phong"){
            const idOffset = builder.createString(component.id);
            const cullingOffset = builder.createString(component.culling);
            let imageOrColorOffset: number;
            let imageOrColor: ImageOrColor;
            if(component.diffuse.type === "image"){
                const imageRefOffset = builder.createString(component.diffuse.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                imageOrColorOffset = Image.endImage(builder);
                imageOrColor = ImageOrColor.Image;
            }
            else{
                Vec3.startVec3(builder);
                Vec3.addX(builder, component.diffuse.color.x);
                Vec3.addY(builder, component.diffuse.color.y);
                Vec3.addZ(builder, component.diffuse.color.z);
                const colorOffset = Vec3.endVec3(builder);
                Color.startColor(builder);
                Color.addColor(builder, colorOffset);
                imageOrColorOffset = Color.endColor(builder);
                imageOrColor = ImageOrColor.Color;
            }
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.specular.x);
            Vec3.addY(builder, component.specular.y);
            Vec3.addZ(builder, component.specular.z);
            const specularOffset = Vec3.endVec3(builder);
            PhongShading.startPhongShading(builder);
            PhongShading.addId(builder, idOffset);
            PhongShading.addCulling(builder, cullingOffset);
            PhongShading.addTransparent(builder, component.transparent);
            PhongShading.addDiffuse(builder, imageOrColorOffset);
            PhongShading.addDiffuseType(builder, imageOrColor);
            PhongShading.addSpecular(builder, specularOffset);
            PhongShading.addShininess(builder, component.shininess);
            componentOffset = PhongShading.endPhongShading(builder);
            componentTypeOffsets.push(Component.PhongShading);
        }
        else if(component.type === "Shading" && component.shaderType === "pbr"){
            const idOffset = builder.createString(component.id);
            const cullingOffset = builder.createString(component.culling);
            let imageOrColorOffset: number;
            let imageOrColor: ImageOrColor;
            if(component.diffuse.type === "image"){
                const imageRefOffset = builder.createString(component.diffuse.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                imageOrColorOffset = Image.endImage(builder);
                imageOrColor = ImageOrColor.Image;
            }
            else{
                Vec3.startVec3(builder);
                Vec3.addX(builder, component.diffuse.color.x);
                Vec3.addY(builder, component.diffuse.color.y);
                Vec3.addZ(builder, component.diffuse.color.z);
                const colorOffset = Vec3.endVec3(builder);
                Color.startColor(builder);
                Color.addColor(builder, colorOffset);
                imageOrColorOffset = Color.endColor(builder);
                imageOrColor = ImageOrColor.Color;
            }
            let imageOrValueOffset_metal: number;
            let imageOrValue_metal: ImageOrValue;
            if(component.metallic.type === "image"){
                const imageRefOffset = builder.createString(component.metallic.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                imageOrValueOffset_metal = Image.endImage(builder);
                imageOrValue_metal = ImageOrValue.Image;
            }
            else{
                Value.startValue(builder);
                Value.addValue(builder, component.metallic.value);
                imageOrValueOffset_metal = Value.endValue(builder);
                imageOrValue_metal = ImageOrValue.Value;
            }
            let imageOrValueOffset_roughness: number;
            let imageOrValue_roughness: ImageOrValue;
            if(component.roughness.type === "image"){
                const imageRefOffset = builder.createString(component.roughness.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                imageOrValueOffset_roughness = Image.endImage(builder);
                imageOrValue_roughness = ImageOrValue.Image;
            }
            else{
                Value.startValue(builder);
                Value.addValue(builder, component.roughness.value);
                imageOrValueOffset_roughness = Value.endValue(builder);
                imageOrValue_roughness = ImageOrValue.Value;
            }

            let imageOrColorOffset_emissive: number;
            let imageOrColor_emissive: ImageOrColor;
            if(component.emissive.color.type === "image"){
                const imageRefOffset = builder.createString(component.emissive.color.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                imageOrColorOffset_emissive = Image.endImage(builder);
                imageOrColor_emissive = ImageOrColor.Image;
            }
            else{
                Vec3.startVec3(builder);
                Vec3.addX(builder, component.emissive.color.color.x);
                Vec3.addY(builder, component.emissive.color.color.y);
                Vec3.addZ(builder, component.emissive.color.color.z);
                const colorOffset = Vec3.endVec3(builder);
                Color.startColor(builder);
                Color.addColor(builder, colorOffset);
                imageOrColorOffset_emissive = Color.endColor(builder);
                imageOrColor_emissive = ImageOrColor.Color;
            }
            Emissive.startEmissive(builder);
            Emissive.addColor(builder, imageOrColorOffset_emissive);
            Emissive.addColorType(builder, imageOrColor_emissive);
            Emissive.addIntensity(builder, component.emissive.intensity);
            const emissiveOffset = Emissive.endEmissive(builder);

            let optionalImageOffset_normal: number;
            let optionalImage_normal: OptionalImage;
            if(component.normal.type === "image"){
                const imageRefOffset = builder.createString(component.normal.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                optionalImageOffset_normal = Image.endImage(builder);
                optionalImage_normal = OptionalImage.Image;
            }
            else{
                None.startNone(builder);
                optionalImageOffset_normal = None.endNone(builder);
                optionalImage_normal = OptionalImage.None;
            }
            let optionalImageOffset_ao: number;
            let optionalImage_ao: OptionalImage;
            if(component.ao.type === "image"){
                const imageRefOffset = builder.createString(component.ao.imageRef);
                Image.startImage(builder);
                Image.addImageRef(builder, imageRefOffset);
                optionalImageOffset_ao = Image.endImage(builder);
                optionalImage_ao = OptionalImage.Image;
            }
            else{
                None.startNone(builder);
                optionalImageOffset_ao = None.endNone(builder);
                optionalImage_ao = OptionalImage.None;
            }
            PbrShading.startPbrShading(builder);
            PbrShading.addId(builder, idOffset);
            PbrShading.addCulling(builder, cullingOffset);
            PbrShading.addTransparent(builder, component.transparent);
            PbrShading.addDiffuse(builder, imageOrColorOffset);
            PbrShading.addDiffuseType(builder, imageOrColor);
            PbrShading.addMetallic(builder, imageOrValueOffset_metal);
            PbrShading.addMetallicType(builder, imageOrValue_metal);
            PbrShading.addRoughness(builder, imageOrValueOffset_roughness);
            PbrShading.addRoughnessType(builder, imageOrValue_roughness);
            PbrShading.addReflectance(builder, component.reflectance);
            PbrShading.addEmissive(builder, emissiveOffset);
            PbrShading.addNormal(builder, optionalImageOffset_normal);
            PbrShading.addNormalType(builder, optionalImage_normal);
            PbrShading.addAo(builder, optionalImageOffset_ao);
            PbrShading.addAoType(builder, optionalImage_ao);
            componentOffset = PbrShading.endPbrShading(builder);
            componentTypeOffsets.push(Component.PbrShading);
        }
        else if(component.type === "Light" && component.lightType === "DirectionalLight"){
            const idOffset = builder.createString(component.id);
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.color.x);
            Vec3.addY(builder, component.color.y);
            Vec3.addZ(builder, component.color.z);
            const colorOffset = Vec3.endVec3(builder);
            DirectionalLight.startDirectionalLight(builder);
            DirectionalLight.addId(builder, idOffset);
            DirectionalLight.addColor(builder, colorOffset);
            DirectionalLight.addIntensity(builder, component.intensity);
            componentOffset = DirectionalLight.endDirectionalLight(builder);
            componentTypeOffsets.push(Component.DirectionalLight);
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
        else if(component.type === "Light" && component.lightType === "SpotLight"){
            const idOffset = builder.createString(component.id);
            Vec3.startVec3(builder);
            Vec3.addX(builder, component.color.x);
            Vec3.addY(builder, component.color.y);
            Vec3.addZ(builder, component.color.z);
            const colorOffset = Vec3.endVec3(builder);
            SpotLight.startSpotLight(builder);
            SpotLight.addId(builder, idOffset);
            SpotLight.addColor(builder, colorOffset);
            SpotLight.addIntensity(builder, component.intensity);
            SpotLight.addRadius(builder, component.radius);
            SpotLight.addInnerAngle(builder, component.innerAngle);
            SpotLight.addOuterAngle(builder, component.outerAngle);
            componentOffset = SpotLight.endSpotLight(builder);
            componentTypeOffsets.push(Component.SpotLight);
        }
        else if(component.type === "SkyBox"){
            const idOffset = builder.createString(component.id);
            const hdrRefOffset = builder.createString(component.hdrRef);
            SkyBox.startSkyBox(builder);
            SkyBox.addId(builder, idOffset);
            SkyBox.addHdrRef(builder, hdrRefOffset);
            componentOffset = SkyBox.endSkyBox(builder);
            componentTypeOffsets.push(Component.SkyBox);
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

export function buildVec3(builder: Builder, vec3: ShotEngineType.Vec3){
    Vec3.startVec3(builder);
    Vec3.addX(builder, vec3.x);
    Vec3.addY(builder, vec3.y);
    Vec3.addZ(builder, vec3.z);
   return Vec3.endVec3(builder);
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
                transparent: simpleShading.transparent(),
                color: getVec3(simpleShading.color())
            });
        }
        if(componentType === Component.PhongShading){
            const phongShading = gameObject.components(i, new PhongShading()) as PhongShading;
            const diffuseType = phongShading.diffuseType();
            let diffuse: Image | Color;
            let diffuseOut: ShotEngineType.PhongShading["diffuse"];
            if(diffuseType === ImageOrColor.Image){
                diffuse = phongShading.diffuse(new Image()) as Image;
                diffuseOut = {
                    type: "image",
                    imageRef: diffuse.imageRef() ?? ""
                }
            }
            else{
                diffuse = phongShading.diffuse(new Color()) as Color;
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
                specular: getVec3(phongShading.specular()),
                shininess: phongShading.shininess(),
            });
        }
        if(componentType === Component.PbrShading){
            const pbrShading = gameObject.components(i, new PbrShading()) as PbrShading;
            const diffuseType = pbrShading.diffuseType();
            let diffuse: Image | Color;
            let diffuseOut: ShotEngineType.PbrShading["diffuse"];
            if(diffuseType === ImageOrColor.Image){
                diffuse = pbrShading.diffuse(new Image()) as Image;
                diffuseOut = {
                    type: "image",
                    imageRef: diffuse.imageRef() ?? ""
                }
            }
            else{
                diffuse = pbrShading.diffuse(new Color()) as Color;
                diffuseOut = {
                    type: "color",
                    color: getVec3(diffuse.color())
                }
            }
            const metalType = pbrShading.metallicType();
            let metal: Image | Value;
            let metalOut: ShotEngineType.PbrShading["metallic"];
            if(metalType === ImageOrValue.Image){
                metal = pbrShading.metallic(new Image()) as Image;
                metalOut = {
                    type: "image",
                    imageRef: metal.imageRef() ?? ""
                }
            }
            else{
                metal = pbrShading.metallic(new Value()) as Value;
                metalOut = {
                    type: "value",
                    value: metal.value()
                }
            }
            const roughnessType = pbrShading.metallicType();
            let roughness: Image | Value;
            let roughnessOut: ShotEngineType.PbrShading["roughness"];
            if(roughnessType === ImageOrValue.Image){
                roughness = pbrShading.roughness(new Image()) as Image;
                roughnessOut = {
                    type: "image",
                    imageRef: roughness.imageRef() ?? ""
                }
            }
            else{
                roughness = pbrShading.roughness(new Value()) as Value;
                roughnessOut = {
                    type: "value",
                    value: roughness.value()
                }
            }

            const emissive = pbrShading.emissive() as Emissive;
            const emissiveColorType = emissive.colorType();
            let emissiveColor: Image | Color;
            let emissiveColorOut: ShotEngineType.PbrShading["emissive"]["color"];
            if(emissiveColorType === ImageOrColor.Image){
                emissiveColor = emissive.color(new Image()) as Image;
                emissiveColorOut = {
                    type: "image",
                    imageRef: emissiveColor.imageRef() ?? ""
                }
            }
            else{
                emissiveColor = emissive.color(new Color()) as Color;
                emissiveColorOut = {
                    type: "color",
                    color: getVec3(emissiveColor.color())
                }
            }
            const emissiveOut: ShotEngineType.PbrShading["emissive"] = {
                color: emissiveColorOut,
                intensity: emissive.intensity(),
            }

            const normalType = pbrShading.normalType();
            let normal: Image;
            let normalOut: ShotEngineType.PbrShading["normal"];
            if(normalType === OptionalImage.Image){
                normal = pbrShading.normal(new Image()) as Image;
                normalOut = {
                    type: "image",
                    imageRef: normal.imageRef() ?? ""
                }
            }
            else{
                normalOut = {
                    type: "none"
                }
            }
            const aoType = pbrShading.aoType();
            let ao: Image;
            let aoOut: ShotEngineType.PbrShading["ao"];
            if(aoType === OptionalImage.Image){
                ao = pbrShading.normal(new Image()) as Image;
                aoOut = {
                    type: "image",
                    imageRef: ao.imageRef() ?? ""
                }
            }
            else{
                aoOut = {
                    type: "none"
                }
            }
            gameObjectResult.components.push({
                type: "Shading",
                shaderType: "pbr",
                id: pbrShading.id() ?? "",
                culling: getCulling(pbrShading.culling()),
                transparent: pbrShading.transparent(),
                diffuse: diffuseOut,
                metallic: metalOut,
                roughness: roughnessOut,
                reflectance: pbrShading.reflectance(),
                emissive: emissiveOut,
                normal: normalOut,
                ao: aoOut
            });
        }
        if(componentType === Component.DirectionalLight){
            const directionalLight = gameObject.components(i, new DirectionalLight()) as DirectionalLight;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "DirectionalLight",
                id: directionalLight.id() ?? "",
                color: getVec3(directionalLight.color()),
                intensity: directionalLight.intensity(),
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
        if(componentType === Component.SpotLight){
            const spotLight = gameObject.components(i, new SpotLight()) as SpotLight;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "SpotLight",
                id: spotLight.id() ?? "",
                color: getVec3(spotLight.color()),
                intensity: spotLight.intensity(),
                radius: spotLight.radius(),
                innerAngle: spotLight.innerAngle(),
                outerAngle: spotLight.outerAngle(),
            });
        }
        if(componentType === Component.SkyBox){
            const skyBox = gameObject.components(i, new SkyBox()) as SkyBox;
            gameObjectResult.components.push({
                type: "SkyBox",
                id: skyBox.id() ?? "",
                hdrRef: skyBox.hdrRef() ?? ""
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
export function getUint8Array(arrayIn?: Uint8Array | null){
    // create new Uint8Array by copy arrayIn
    return arrayIn ? new Uint8Array(arrayIn) : new Uint8Array();
}
export function getFloat32Array(arrayIn?: Float32Array | null){
    // create new Float32Array by copy arrayIn
    return arrayIn ? new Float32Array(arrayIn) : new Float32Array();
}
