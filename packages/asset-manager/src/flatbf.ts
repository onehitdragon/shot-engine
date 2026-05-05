import { Builder, Offset, ByteBuffer } from "flatbuffers";
import * as ShotEngineType from "@shot-engine/types";
import fs from "fs-extra";
import {
    Vec3, Vec4,
    ImageAsset, PrimitiveAttribute, Primitive, MeshAsset, PrefabAsset, 
    SceneNode, GameObject, GameObjectPrefab, Component, Transform, Mesh,
    SimpleShading, PhongShading, ImageDiffuse, ColorDiffuse,
    Diffuse,
    PointLight,
    DirectionalLight
} from "../fbs-gen/fbsengine";
import { getCulling, getVec3 } from "./flatbfUtil";

export function saveImageAssetBinary(imageAsset: ShotEngineType.ImageAsset, filePath: string){
    const builder = new Builder(1024);
    const dataOffset = ImageAsset.createDataVector(builder, imageAsset.data);
    ImageAsset.startImageAsset(builder);
    ImageAsset.addWidth(builder, imageAsset.width);
    ImageAsset.addHeight(builder, imageAsset.height);
    ImageAsset.addData(builder, dataOffset);
    const offset = ImageAsset.endImageAsset(builder);
    builder.finish(offset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function saveMeshAssetBinary(meshAsset: ShotEngineType.MeshAsset, filePath: string){
    const builder = new Builder(1024);
    const primitiveOffsets: Offset[] = [];
    for(const prim of meshAsset.primitives){
        const positionsOffset = PrimitiveAttribute.createPositionsVector(builder, prim.attribute.positions);
        const normalsOffset = PrimitiveAttribute.createNormalsVector(builder, prim.attribute.normals);
        const uvsOffset = PrimitiveAttribute.createNormalsVector(builder, prim.attribute.uvs);
        PrimitiveAttribute.startPrimitiveAttribute(builder);
        PrimitiveAttribute.addPositions(builder, positionsOffset);
        PrimitiveAttribute.addNormals(builder, normalsOffset);
        PrimitiveAttribute.addUvs(builder, uvsOffset);
        const attrOffset = PrimitiveAttribute.endPrimitiveAttribute(builder);

        const indicesOffset = Primitive.createIndicesVector(builder, prim.indices);
        Primitive.startPrimitive(builder);
        Primitive.addAttribute(builder, attrOffset);
        Primitive.addIndices(builder, indicesOffset);
        primitiveOffsets.push(Primitive.endPrimitive(builder));
    }
    const primitivesOffset = MeshAsset.createPrimitivesVector(builder, primitiveOffsets);
    MeshAsset.startMeshAsset(builder);
    MeshAsset.addPrimitives(builder, primitivesOffset);
    const meshOffset = MeshAsset.endMeshAsset(builder);
    builder.finish(meshOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function savePrefabAssetBinary(prefabAsset: ShotEngineType.PrefabAsset, filePath: string){
    const builder = new Builder(1024);
    function recurGameObject(sceneNode: ShotEngineType.SceneNode): Offset{
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
        const childTypeOffsets: Offset[] = [];
        for(const child of go.childs){
            const sceneNodeOffset = recurGameObject(child);
            if("prefabRef" in child){
                childTypeOffsets.push(SceneNode.GameObjectPrefab);
            }
            else{
                childTypeOffsets.push(SceneNode.GameObject);
            }
            childOffsets.push(sceneNodeOffset);
        }
        const componentOffsets: Offset[] = [];
        const componentTypeOffsets: Offset[] = [];
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
                const idOffset = builder.createString(component.id);
                Transform.startTransform(builder);
                Transform.addId(builder, idOffset);
                Transform.addPos(builder, posOffset);
                Transform.addRot(builder, rotOffset);
                Transform.addScale(builder, scaleOffset);
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
    const goRootOffset = recurGameObject(prefabAsset.root);
    PrefabAsset.startPrefabAsset(builder);
    PrefabAsset.addRoot(builder, goRootOffset);
    const prefabAssetOffset = PrefabAsset.endPrefabAsset(builder);
    builder.finish(prefabAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}

export function readImageAsset(filePath: string): ShotEngineType.ImageAsset{
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const image = ImageAsset.getRootAsImageAsset(byteBuffer);
    return {
        width: image.width(),
        height: image.height(),
        data: image.dataArray() ?? new Uint8Array()
    };
}
export function readMeshAsset(filePath: string){
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const mesh = MeshAsset.getRootAsMeshAsset(byteBuffer);

    const asset: ShotEngineType.MeshAsset = {
        primitives: []
    }
    for(let i = 0; i < mesh.primitivesLength(); i++){
        const prim = mesh.primitives(i, new Primitive());
        if(!prim) continue;
        const attr = prim.attribute(new PrimitiveAttribute());
        if(!attr) continue;
        asset.primitives.push({
            attribute: {
                positions: attr.positionsArray() ?? new Float32Array(),
                normals: attr.normalsArray() ?? new Float32Array(),
                uvs:  attr.uvsArray() ?? new Float32Array(),
            },
            indices: prim.indicesArray() ?? new Uint32Array()
        });
    }
    return asset;
}
export function readPrefabAsset(filePath: string){
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const prefabAsset = PrefabAsset.getRootAsPrefabAsset(byteBuffer);
    const root = prefabAsset.root()!;
    function recurPrint(gameObject: typeof root){
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
                    scale: { x: scale.x(), y: scale.y(), z: scale.z() }
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
            if(componentType === Component.PointLight){
                const pointLight = gameObject.components(i, new PointLight()) as PointLight;
                gameObjectResult.components.push({
                    type: "Light",
                    lightType: "PointLight",
                    id: pointLight.id() ?? "",
                    color: getVec3(pointLight.color())
                });
            }
            if(componentType === Component.DirectionalLight){
                const directionalLight = gameObject.components(i, new DirectionalLight()) as DirectionalLight;
                gameObjectResult.components.push({
                    type: "Light",
                    lightType: "DirectionalLight",
                    id: directionalLight.id() ?? "",
                    dir: getVec3(directionalLight.dir())
                });
            }
        }

        for(let i = 0; i < gameObject.childsLength(); i++){
            const childType = gameObject.childsType(i);
            if(childType === SceneNode.GameObject){
                const go = gameObject.childs(i, new GameObject()) as GameObject;
                gameObjectResult.childs.push(recurPrint(go));
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
    
    const asset: ShotEngineType.PrefabAsset = {
        root: recurPrint(root)
    }
    return asset;
}
