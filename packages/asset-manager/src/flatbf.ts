import { Builder, Offset, ByteBuffer } from "flatbuffers";
import * as ShotEngineType from "@shot-engine/types";
import fs from "fs-extra";
import {
    SceneNode, GameObject, GameObjectPrefab, Scene,
} from "../fbs-gen/fbsengine.js";
import {
    ImageAsset, PrimitiveAttribute, Primitive, MeshAsset, PrefabAsset,
    SceneAsset,
    HdrImage,
    HdrCube,
    HdrAsset,
    PrefilterMap,
    AABB,
    FontAsset,
    AtlasTexture,
    FontInfo,
    FontInfoChar,
    FontInfoCommon,
    FontAssetBakeSetting,
    ProjectSettingAsset,
    SceneSetting,
    MaterialAsset,
    Material,
    SimpleMaterial,
    PbrMaterial,
    GLTypeAndNormalized
} from "../fbs-gen/fbsasset.js";
import { buildSceneNode, buildVec3, buildVec4, getFloat32Array, getUint8Array, getVec3, getVec4, readGameObject } from "./flatbfUtil.js";
// import * as RTAsset from "./runtime-asset.js";
import { RTImageAsset } from "../fbs-gen/fbsrtasset.js";

export function saveImageAssetBinary(imageAsset: ShotEngineType.ImageAsset, filePath: string){
    const builder = new Builder(1024);
    const originOffset = ImageAsset.createOriginVector(builder, imageAsset.origin);
    const ktx2Offset = ImageAsset.createKtx2Vector(builder, imageAsset.ktx2);
    ImageAsset.startImageAsset(builder);
    ImageAsset.addOrigin(builder, originOffset);
    ImageAsset.addKtx2(builder, ktx2Offset);
    ImageAsset.addHasAlpha(builder, imageAsset.hasAlpha);
    const offset = ImageAsset.endImageAsset(builder);
    builder.finish(offset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
// export function rtImageAssetToBinary(rtImageAsset: RTAsset.RTImageAsset){
//     const builder = new Builder(1024);
//     const compressedDataOffset = RTImageAsset.createCompressedDataVector(builder, rtImageAsset.compressedData);
//     RTImageAsset.startRTImageAsset(builder);
//     RTImageAsset.addCompressedData(builder, compressedDataOffset);
//     RTImageAsset.addSRgb(builder, rtImageAsset.sRGB);
//     RTImageAsset.addWrapMode(builder, rtImageAsset.wrapMode);
//     RTImageAsset.addFilterMode(builder, rtImageAsset.filterMode);
//     const offset = RTImageAsset.endRTImageAsset(builder);
//     builder.finish(offset);

//     return builder.asUint8Array();
// }
export function saveMeshAssetBinary(meshAsset: ShotEngineType.MeshAsset, filePath: string){
    const builder = new Builder(1024);
    const primitiveOffsets: Offset[] = [];
    for(const prim of meshAsset.primitives){
        const positonOffset = buildGLTypeAndNormalized(builder, prim.attribute.position);
        const normalOffset = buildGLTypeAndNormalized(builder, prim.attribute.normal);
        const uvOffset = buildGLTypeAndNormalized(builder, prim.attribute.uv);
        const tangentOffset = buildGLTypeAndNormalized(builder, prim.attribute.tangent);
        const jointOffset = buildGLTypeAndNormalized(builder, prim.attribute.joint);
        const weightOffset = buildGLTypeAndNormalized(builder, prim.attribute.weight);
        const interleaveArrayOffset = PrimitiveAttribute.createInterleaveArrayVector(builder, prim.attribute.interleaveArray);
        PrimitiveAttribute.startPrimitiveAttribute(builder);
        PrimitiveAttribute.addInterleaveArray(builder, interleaveArrayOffset);
        PrimitiveAttribute.addPosition(builder, positonOffset);
        PrimitiveAttribute.addNormal(builder, normalOffset);
        PrimitiveAttribute.addUv(builder, uvOffset);
        PrimitiveAttribute.addTangent(builder, tangentOffset);
        PrimitiveAttribute.addJoint(builder, jointOffset);
        PrimitiveAttribute.addWeight(builder, weightOffset);
        const attrOffset = PrimitiveAttribute.endPrimitiveAttribute(builder);

        const indicesOffset = builder.createByteVector(prim.indices);

        const minOffset = buildVec3(builder, prim.aabb.min);
        const maxOffset = buildVec3(builder, prim.aabb.max);
        AABB.startAABB(builder);
        AABB.addMin(builder, minOffset);
        AABB.addMax(builder, maxOffset);
        const aabbOffset = AABB.endAABB(builder);

        Primitive.startPrimitive(builder);
        Primitive.addAttribute(builder, attrOffset);
        Primitive.addIndices(builder, indicesOffset);
        Primitive.addIndexType(builder, prim.indexType);
        Primitive.addDrawMode(builder, prim.drawMode);
        Primitive.addAabb(builder, aabbOffset);
        primitiveOffsets.push(Primitive.endPrimitive(builder));
    }
    const primitivesOffset = MeshAsset.createPrimitivesVector(builder, primitiveOffsets);

    const invBindPoseMatricesOffset = MeshAsset.createInvBindPoseMatricesVector(builder, meshAsset.invBindPoseMatrices);

    MeshAsset.startMeshAsset(builder);
    MeshAsset.addPrimitives(builder, primitivesOffset);
    MeshAsset.addInvBindPoseMatrices(builder, invBindPoseMatricesOffset);
    const meshOffset = MeshAsset.endMeshAsset(builder);
    builder.finish(meshOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function saveMaterialAssetBinary(matAsset: ShotEngineType.MaterialAsset, filePath: string){
    const builder = new Builder(1024);
    let materialOffset: number;
    let materialType: Material;
    if(matAsset.matType === "simple"){
        const colorOffset = buildVec4(builder, matAsset.color);

        SimpleMaterial.startSimpleMaterial(builder);
        SimpleMaterial.addCulling(builder, cullingToNum(matAsset.culling));
        SimpleMaterial.addTransparent(builder, transparentToNum(matAsset.transparent));
        SimpleMaterial.addAlphaCutoff(builder, matAsset.alphaCutoff);
        SimpleMaterial.addColor(builder, colorOffset);

        materialOffset = SimpleMaterial.endSimpleMaterial(builder);
        materialType = Material.SimpleMaterial;
    }
    else if(matAsset.matType === "pbr"){
        const baseFactorOffset = buildVec4(builder, matAsset.baseFactor);
        const baseTextureRefOffset = builder.createString(matAsset.baseTextureRef);
        const metallicRoughnessTextureRefOffset = builder.createString(matAsset.metallicRoughnessTextureRef);
        const normalTextureRefOffset = builder.createString(matAsset.normalTextureRef);
        const emissiveFactorOffset = buildVec3(builder, matAsset.emissitveFactor);
        const emissiveTextureRefOffset = builder.createString(matAsset.emissiveTextureRef);
        const occlusionTextureRefOffset = builder.createString(matAsset.occlusionTextureRef);

        PbrMaterial.startPbrMaterial(builder);
        PbrMaterial.addCulling(builder, cullingToNum(matAsset.culling));
        PbrMaterial.addTransparent(builder, transparentToNum(matAsset.transparent));
        PbrMaterial.addAlphaCutoff(builder, matAsset.alphaCutoff);
        PbrMaterial.addBaseFactor(builder, baseFactorOffset);
        PbrMaterial.addBaseTextureRef(builder, baseTextureRefOffset);
        PbrMaterial.addRoughnessFactor(builder, matAsset.roughnessFactor);
        PbrMaterial.addMetallicFactor(builder, matAsset.metallicFactor);
        PbrMaterial.addMetallicRoughnessTextureRef(builder, metallicRoughnessTextureRefOffset);
        PbrMaterial.addNormalScale(builder, matAsset.normalScale);
        PbrMaterial.addNormalTextureRef(builder, normalTextureRefOffset);
        PbrMaterial.addEmissitveFactor(builder, emissiveFactorOffset);
        PbrMaterial.addEmissiveTextureRef(builder, emissiveTextureRefOffset);
        PbrMaterial.addOcclusionStrength(builder, matAsset.occlusionStrength);
        PbrMaterial.addOcclusionTextureRef(builder, occlusionTextureRefOffset);

        materialOffset = PbrMaterial.endPbrMaterial(builder);
        materialType = Material.PbrMaterial;
    }
    else throw "mat type dont support";
    MaterialAsset.startMaterialAsset(builder);
    MaterialAsset.addMaterial(builder, materialOffset);
    MaterialAsset.addMaterialType(builder, materialType);
    const materialAssetOffset = MaterialAsset.endMaterialAsset(builder);
    builder.finish(materialAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function savePrefabAssetBinary(prefabAsset: ShotEngineType.PrefabAsset, filePath: string){
    const builder = new Builder(1024);
    const goRootOffset = buildSceneNode(builder, prefabAsset.root);
    PrefabAsset.startPrefabAsset(builder);
    PrefabAsset.addRoot(builder, goRootOffset);
    const prefabAssetOffset = PrefabAsset.endPrefabAsset(builder);
    builder.finish(prefabAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function saveSceneAssetBinary(sceneAsset: ShotEngineType.SceneAsset, filePath: string){
    const builder = new Builder(1024);
    const rootOffsets: Offset[] = [];
    const rootTypes: SceneNode[] = [];
    for(const root of sceneAsset.scene.roots){
        const rootOffset = buildSceneNode(builder, root);
        rootOffsets.push(rootOffset);
        if("prefabRef" in root) rootTypes.push(SceneNode.GameObjectPrefab)
        else rootTypes.push(SceneNode.GameObject)
    }
    const idOffset = builder.createString(sceneAsset.scene.id);
    const nameOffset = builder.createString(sceneAsset.scene.name);
    const rootsOffset = Scene.createRootsVector(builder, rootOffsets);
    const rootTypesOffset = Scene.createRootsTypeVector(builder, rootTypes);
    Scene.startScene(builder);
    Scene.addId(builder, idOffset);
    Scene.addName(builder, nameOffset);
    Scene.addRoots(builder, rootsOffset);
    Scene.addRootsType(builder, rootTypesOffset);
    const sceneOffset = Scene.endScene(builder);
    SceneAsset.startSceneAsset(builder);
    SceneAsset.addScene(builder, sceneOffset);
    const sceneAssetOffset = SceneAsset.endSceneAsset(builder);
    builder.finish(sceneAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function saveHdrAssetBinary(hdrAsset: ShotEngineType.HdrAsset, filePath: string){
    const { enviromentMap, irradianceMap, prefilterMap, brdfLUT } = hdrAsset;
    const builder = new Builder(1024);
    function createHdrImage(hdrImage: ShotEngineType.HdrImage){
        const dataOffset = HdrImage.createDataVector(builder, hdrImage.data);
        HdrImage.startHdrImage(builder);
        HdrImage.addWidth(builder, hdrImage.width);
        HdrImage.addHeight(builder, hdrImage.height);
        HdrImage.addData(builder, dataOffset);
        return HdrImage.endHdrImage(builder);
    }
    function createHdrCube(hdrCube: ShotEngineType.HdrCube){
        const rightHdrImageOffset = createHdrImage(hdrCube.right);
        const leftHdrImageOffset = createHdrImage(hdrCube.left);
        const topHdrImageOffset = createHdrImage(hdrCube.top);
        const bottomHdrImageOffset = createHdrImage(hdrCube.bottom);
        const fontHdrImageOffset = createHdrImage(hdrCube.font);
        const backHdrImageOffset = createHdrImage(hdrCube.back);
        HdrCube.startHdrCube(builder);
        HdrCube.addRight(builder, rightHdrImageOffset);
        HdrCube.addLeft(builder, leftHdrImageOffset);
        HdrCube.addTop(builder, topHdrImageOffset);
        HdrCube.addBottom(builder, bottomHdrImageOffset);
        HdrCube.addFont(builder, fontHdrImageOffset);
        HdrCube.addBack(builder, backHdrImageOffset);
        return HdrCube.endHdrCube(builder);
    }
    const envMapOffset = createHdrCube(enviromentMap);
    const irradianceMapOffset = createHdrCube(irradianceMap);

    const mipMapOffsets: Offset[] = [];
    for(const mipMap of prefilterMap.mipMaps){
        const mipMapOffset = createHdrCube(mipMap);
        mipMapOffsets.push(mipMapOffset);
    }
    const mipMapsOffset = PrefilterMap.createMipMapsVector(builder, mipMapOffsets);
    PrefilterMap.startPrefilterMap(builder);
    PrefilterMap.addMipMapCount(builder, prefilterMap.mipMapCount);
    PrefilterMap.addMipMaps(builder, mipMapsOffset);
    const prefilterMapOffset = PrefilterMap.endPrefilterMap(builder);

    const brdfLUTOffset = createHdrImage(brdfLUT);

    HdrAsset.startHdrAsset(builder);
    HdrAsset.addEnviromentMap(builder, envMapOffset);
    HdrAsset.addIrradianceMap(builder, irradianceMapOffset);
    HdrAsset.addPrefilterMap(builder, prefilterMapOffset);
    HdrAsset.addBrdfLut(builder, brdfLUTOffset);
    const hdrAssetOffset = HdrAsset.endHdrAsset(builder);
    builder.finish(hdrAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function saveProjectSettingAssetBinary(projectSettingAsset: ShotEngineType.ProjectSettingAsset, filePath: string){
    const { scene } = projectSettingAsset;
    const builder = new Builder(1024);

    const mainRefOffset = builder.createString(scene.mainRef);
    const importRefOffsets: Offset[] = [];
    for(const importRef of scene.importRefs){
        const importRefOffset = builder.createString(importRef);
        importRefOffsets.push(importRefOffset);
    }
    const importRefsOffset = SceneSetting.createImportRefsVector(builder, importRefOffsets);

    SceneSetting.startSceneSetting(builder);
    if(scene.mainRef) SceneSetting.addMainRef(builder, mainRefOffset);
    SceneSetting.addImportRefs(builder, importRefsOffset);
    const sceneSettingOffset = SceneSetting.endSceneSetting(builder);

    ProjectSettingAsset.startProjectSettingAsset(builder);
    ProjectSettingAsset.addScene(builder, sceneSettingOffset);
    const projectSettingAssetOffset = ProjectSettingAsset.endProjectSettingAsset(builder);
    builder.finish(projectSettingAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}
export function saveFontAssetBinary(fontAsset: ShotEngineType.FontAsset, filePath: string){
    const { bakeSetting, atlasTextures, fontInfo } = fontAsset;
    const builder = new Builder(1024);

    FontAssetBakeSetting.startFontAssetBakeSetting(builder);
    FontAssetBakeSetting.addFieldType(builder, bakeSetting.fieldType);
    FontAssetBakeSetting.addFontSize(builder, bakeSetting.fontSize);
    FontAssetBakeSetting.addTextureWidth(builder, bakeSetting.textureWidth);
    FontAssetBakeSetting.addTextureHeight(builder, bakeSetting.textureHeight);
    const fontAssetBakeSettingOffset = FontAssetBakeSetting.endFontAssetBakeSetting(builder);

    const atlasTextureOffsets: number[] = [];
    for(const atlasTexture of atlasTextures){
        const dataOffset = AtlasTexture.createDataVector(builder, atlasTexture);
        AtlasTexture.startAtlasTexture(builder);
        AtlasTexture.addData(builder, dataOffset);
        const atlasTextureOffset = AtlasTexture.endAtlasTexture(builder);
        atlasTextureOffsets.push(atlasTextureOffset);
    }
    const atlasTexturesOffset = FontAsset.createAtlasTexturesVector(builder, atlasTextureOffsets);

    const charOffsets: number[] = [];
    for(const char of fontInfo.chars){
        const charCharOffset = builder.createString(char.char)
        FontInfoChar.startFontInfoChar(builder);
        FontInfoChar.addId(builder, char.id);
        FontInfoChar.addChar(builder, charCharOffset);
        FontInfoChar.addXoffset(builder, char.xoffset);
        FontInfoChar.addYoffset(builder, char.yoffset);
        FontInfoChar.addWidth(builder, char.width);
        FontInfoChar.addHeight(builder, char.height);
        FontInfoChar.addXadvance(builder, char.xadvance);
        FontInfoChar.addX(builder, char.x);
        FontInfoChar.addY(builder, char.y);
        FontInfoChar.addPage(builder, char.page);
        const charOffset = FontInfoChar.endFontInfoChar(builder);
        charOffsets.push(charOffset);
    }
    const charsOffset = FontInfo.createCharsVector(builder, charOffsets);

    FontInfoCommon.startFontInfoCommon(builder);
    FontInfoCommon.addLineHeight(builder, fontInfo.common.lineHeight);
    const commonOffset = FontInfoCommon.endFontInfoCommon(builder);

    FontInfo.startFontInfo(builder);
    FontInfo.addChars(builder, charsOffset);
    FontInfo.addCommon(builder, commonOffset);
    const fontInfoOffset = FontInfo.endFontInfo(builder);

    FontAsset.startFontAsset(builder);
    FontAsset.addFontAssetBakeSetting(builder, fontAssetBakeSettingOffset);
    FontAsset.addAtlasTextures(builder, atlasTexturesOffset);
    FontAsset.addFontInfo(builder, fontInfoOffset);
    const fontAssetOffset = FontAsset.endFontAsset(builder);
    builder.finish(fontAssetOffset);

    const bytes = builder.asUint8Array();
    fs.writeFileSync(filePath, bytes);
}

export function readImageAsset(filePath: string): ShotEngineType.ImageAsset{
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const image = ImageAsset.getRootAsImageAsset(byteBuffer);
    return {
        origin: getUint8Array(image.originArray()),
        ktx2: getUint8Array(image.ktx2Array()),
        hasAlpha: image.hasAlpha(),
    };
}
export function readMeshAsset(filePath: string){
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const mesh = MeshAsset.getRootAsMeshAsset(byteBuffer);

    const asset: ShotEngineType.MeshAsset = {
        primitives: [],
        invBindPoseMatrices: new Float32Array()
    }
    for(let i = 0; i < mesh.primitivesLength(); i++){
        const prim = mesh.primitives(i, new Primitive());
        if(!prim) continue;
        const attr = prim.attribute(new PrimitiveAttribute());
        if(!attr) continue;

        asset.primitives.push({
            attribute: {
                interleaveArray: getUint8Array(attr.interleaveArrayArray()),
                position: readGLTypeAndNormalized(attr.position()),
                normal: readGLTypeAndNormalized(attr.normal()),
                uv: readGLTypeAndNormalized(attr.uv()),
                tangent: readGLTypeAndNormalized(attr.tangent()),
                joint: readGLTypeAndNormalized(attr.joint()),
                weight: readGLTypeAndNormalized(attr.weight()),
            },
            indices: getUint8Array(prim.indicesArray()),
            indexType: prim.indexType(),
            drawMode: prim.drawMode(),
            aabb: {
                min: getVec3(prim.aabb()?.min()),
                max: getVec3(prim.aabb()?.max()),
            },
        });
    }
    asset.invBindPoseMatrices = getFloat32Array(mesh.invBindPoseMatricesArray());
    return asset;
}
export function readMaterialAsset(filePath: string): ShotEngineType.MaterialAsset{
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const material = MaterialAsset.getRootAsMaterialAsset(byteBuffer);

    if(material.materialType() === Material.SimpleMaterial){
        const simpleMaterial = material.material(new SimpleMaterial()) as SimpleMaterial;
        const asset: ShotEngineType.MaterialAsset = {
            matType: "simple",
            culling: numToCulling(simpleMaterial.culling()),
            transparent: numToTransparent(simpleMaterial.transparent()),
            alphaCutoff: simpleMaterial.alphaCutoff(),
            color: getVec4(simpleMaterial.color()),
        }
        return asset;
    }
    else if(material.materialType() === Material.PbrMaterial){
        const pbrMaterial = material.material(new PbrMaterial()) as PbrMaterial;
        const asset: ShotEngineType.MaterialAsset = {
            matType: "pbr",
            culling: numToCulling(pbrMaterial.culling()),
            transparent: numToTransparent(pbrMaterial.transparent()),
            alphaCutoff: pbrMaterial.alphaCutoff(),
            baseFactor: getVec4(pbrMaterial.baseFactor()),
            baseTextureRef: pbrMaterial.baseTextureRef() || undefined,
            roughnessFactor: pbrMaterial.roughnessFactor(),
            metallicFactor: pbrMaterial.metallicFactor(),
            metallicRoughnessTextureRef: pbrMaterial.metallicRoughnessTextureRef() || undefined,
            normalScale: pbrMaterial.normalScale(),
            normalTextureRef: pbrMaterial.normalTextureRef() || undefined,
            emissitveFactor: getVec3(pbrMaterial.emissitveFactor()),
            emissiveTextureRef: pbrMaterial.emissiveTextureRef() || undefined,
            occlusionStrength: pbrMaterial.occlusionStrength(),
            occlusionTextureRef: pbrMaterial.occlusionTextureRef() || undefined,
        }
        return asset;
    }
    else throw "bad materialType"
}
export function readPrefabAsset(filePath: string){
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const prefabAsset = PrefabAsset.getRootAsPrefabAsset(byteBuffer);
    const root = prefabAsset.root();
    if(!root) return;
    const asset: ShotEngineType.PrefabAsset = {
        root: readGameObject(root)
    }
    return asset;
}
export function readSceneAsset(filePath: string){
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const sceneAsset = SceneAsset.getRootAsSceneAsset(byteBuffer);
    const scene = sceneAsset.scene();
    if(!scene) return;

    const roots: ShotEngineType.SceneNode[] = [];
    for(let i = 0; i < scene.rootsLength(); i++){
        const rootType = scene.rootsType(i);
        if(!rootType) continue;
        if(rootType === SceneNode.GameObject){
            const root = scene.roots(i, new GameObject()) as GameObject;
            roots.push(readGameObject(root));
        }
        if(rootType === SceneNode.GameObjectPrefab){
            const root = scene.roots(i, new GameObjectPrefab()) as GameObjectPrefab;
            roots.push({
                id: root.id() ?? "",
                prefabRef: root.prefabRef() ?? ""
            });
        }
    }
    
    const asset: ShotEngineType.SceneAsset = {
        scene: {
            id: scene.id() ?? "",
            name: scene.name() ?? "",
            roots
        }
    }
    return asset;
}
export function readHdrAsset(filePath: string){
    if(!fs.existsSync(filePath)) return;
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const hdrAsset = HdrAsset.getRootAsHdrAsset(byteBuffer);

    function readHdrImage(hdrImage: HdrImage | null){
        if(!hdrImage) return;
        
        const hdrImageOut: ShotEngineType.HdrImage = {
            width: hdrImage.width(),
            height: hdrImage.height(),
            data: getFloat32Array(hdrImage.dataArray()) 
        }
        return hdrImageOut;
    }
    function readHdrCube(hdrCube : HdrCube | null){
        if(!hdrCube) return;
        const rightHdrImage = readHdrImage(hdrCube.right());
        if(!rightHdrImage) return;
        const leftHdrImage = readHdrImage(hdrCube.left());
        if(!leftHdrImage) return;
        const topHdrImage = readHdrImage(hdrCube.top());
        if(!topHdrImage) return;
        const bottomHdrImage = readHdrImage(hdrCube.bottom());
        if(!bottomHdrImage) return;
        const fontHdrImage = readHdrImage(hdrCube.font());
        if(!fontHdrImage) return;
        const backHdrImage = readHdrImage(hdrCube.back());
        if(!backHdrImage) return;
        const hdrCubeOut: ShotEngineType.HdrCube = {
            right: rightHdrImage,
            left: leftHdrImage,
            top: topHdrImage,
            bottom: bottomHdrImage,
            font: fontHdrImage,
            back: backHdrImage,
        }
        return hdrCubeOut;
    }

    const envMap = hdrAsset.enviromentMap();
    const envMapOut = readHdrCube(envMap);
    if(!envMapOut) return;

    const irradianceMap = hdrAsset.irradianceMap();
    const irradianceMapOut = readHdrCube(irradianceMap);
    if(!irradianceMapOut) return;

    const prefilterMap = hdrAsset.prefilterMap();
    if(!prefilterMap) return;
    const mipMapOuts: ShotEngineType.HdrCube[] = [];
    for(let i = 0; i < prefilterMap.mipMapsLength(); i++){
        const mipMap = prefilterMap.mipMaps(i);
        const mipMapOut = readHdrCube(mipMap);
        if(!mipMapOut) return;
        mipMapOuts.push(mipMapOut);
    }
    const prefilterMapOut: ShotEngineType.HdrAsset["prefilterMap"] = {
        mipMapCount: prefilterMap.mipMapCount(),
        mipMaps: mipMapOuts
    }

    const brdfLUTOut = readHdrImage(hdrAsset.brdfLut());
    if(!brdfLUTOut) return;
    
    const asset: ShotEngineType.HdrAsset = {
        enviromentMap: envMapOut,
        irradianceMap: irradianceMapOut,
        prefilterMap: prefilterMapOut,
        brdfLUT: brdfLUTOut
    }

    return asset;
}
export function readProjectSettingAsset(filePath: string){
    if(!fs.existsSync(filePath)) return;
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const projectSettingAsset = ProjectSettingAsset.getRootAsProjectSettingAsset(byteBuffer);

    const sceneSetting = projectSettingAsset.scene();
    if(!sceneSetting) return;
    const importRefs: string[] = [];
    for(let i = 0; i < sceneSetting.importRefsLength(); i++){
        const importRef = sceneSetting.importRefs(i);
        importRefs.push(importRef);
    }
    
    const asset: ShotEngineType.ProjectSettingAsset = {
        scene: {
            mainRef: sceneSetting.mainRef() || undefined,
            importRefs
        }
    }
    return asset;
}
export function readFontAsset(filePath: string){
    if(!fs.existsSync(filePath)) return;
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const byteBuffer = new ByteBuffer(bytes);
    const fontAsset = FontAsset.getRootAsFontAsset(byteBuffer);

    const fontAssetBakeSetting = fontAsset.fontAssetBakeSetting();
    if(!fontAssetBakeSetting) return;
    const atlasTextures: Uint8Array[] = []
    for(let i = 0; i < fontAsset.atlasTexturesLength(); i++){
        atlasTextures.push(
            getUint8Array(fontAsset.atlasTextures(i)?.dataArray())
        );
    }
    const fontInfo = fontAsset.fontInfo();
    if(!fontInfo) return;
    const chars: ShotEngineType.FontAsset["fontInfo"]["chars"] = [];
    for(let i = 0; i < fontInfo.charsLength(); i++){
        const char = fontInfo.chars(i);
        if(!char) continue;
        chars.push({
            id: char.id(),
            char: char.char() || "",
            xoffset: char.xoffset(),
            yoffset: char.yoffset(),
            xadvance: char.xadvance(),
            width: char.width(),
            height: char.height(),
            x: char.x(),
            y: char.y(),
            page: char.page(),
        });
    }
    const common = fontInfo.common();
    if(!common) return;

    const asset: ShotEngineType.FontAsset = {
        bakeSetting: {
            fieldType: fontAssetBakeSetting.fieldType(),
            fontSize: fontAssetBakeSetting.fontSize(),
            textureWidth: fontAssetBakeSetting.textureWidth(),
            textureHeight: fontAssetBakeSetting.textureHeight(),
        },
        atlasTextures,
        fontInfo: {
            chars,
            common: {
                lineHeight: common.lineHeight()
            }
        },
    }

    return asset;
}

//helper
function buildGLTypeAndNormalized(builder: Builder, { type, normalized }: ShotEngineType.GLTypeAndNormalized){
    GLTypeAndNormalized.startGLTypeAndNormalized(builder);
    GLTypeAndNormalized.addType(builder, type);
    GLTypeAndNormalized.addNormalized(builder, normalized);
    return GLTypeAndNormalized.endGLTypeAndNormalized(builder);
}
function readGLTypeAndNormalized(obj?: GLTypeAndNormalized | null): ShotEngineType.GLTypeAndNormalized{
    if(obj) return { type: obj.type(), normalized: obj.normalized() }
    return { type: -1, normalized: false }
}
function cullingToNum(culling: ShotEngineType.MaterialAsset["culling"]){
    if(culling === "none") return 0;
    if(culling === "back") return 1;
    if(culling === "front") return 2;
    return 0;
}
function numToCulling(num: number): ShotEngineType.MaterialAsset["culling"]{
    if(num === 0) return "none";
    if(num === 1) return "back";
    if(num === 2) return "front";
    return "none";
}
function transparentToNum(transparent: ShotEngineType.MaterialAsset["transparent"]){
    if(transparent === "opaque") return 0;
    if(transparent === "mask") return 1;
    if(transparent === "blend") return 2;
    return 0;
}
function numToTransparent(num: number): ShotEngineType.MaterialAsset["transparent"]{
    if(num === 0) return "opaque";
    if(num === 1) return "mask";
    if(num === 2) return "blend";
    return "opaque";
}

