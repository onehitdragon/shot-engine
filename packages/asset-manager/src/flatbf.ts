import { Builder, Offset, ByteBuffer } from "flatbuffers";
import * as ShotEngineType from "@shot-engine/types";
import fs from "fs-extra";
import {
    ImageAsset, PrimitiveAttribute, Primitive, MeshAsset, PrefabAsset, 
    SceneNode, GameObject, GameObjectPrefab,
    SceneAsset,
    Scene,
    IndexType,
    HdrImage,
    HdrCube,
    HdrAsset,
    PrefilterMap
} from "../fbs-gen/fbsengine";
import { buildSceneNode, getFloat32Array, getUint8Array, readGameObject } from "./flatbfUtil";

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
        const interleaveArrayOffset = PrimitiveAttribute.createInterleaveArrayVector(builder, prim.attribute.interleaveArray);
        PrimitiveAttribute.startPrimitiveAttribute(builder);
        PrimitiveAttribute.addInterleaveArray(builder, interleaveArrayOffset);
        const attrOffset = PrimitiveAttribute.endPrimitiveAttribute(builder);

        const indicesOffset = builder.createByteVector(
            new Uint8Array(
                prim.indices.buffer,
                prim.indices.byteOffset,
                prim.indices.byteLength
            )
        );
        Primitive.startPrimitive(builder);
        Primitive.addAttribute(builder, attrOffset);
        Primitive.addIndices(builder, indicesOffset);
        Primitive.addIndexType(builder, prim.indexType);
        Primitive.addDrawMode(builder, prim.drawMode);
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
    const { enviromentMap, irradianceMap, prefilterMap } = hdrAsset;
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
    PrefilterMap.addMaxShininess(builder, prefilterMap.maxShininess);
    PrefilterMap.addMipMapCount(builder, prefilterMap.mipMapCount);
    PrefilterMap.addMipMaps(builder, mipMapsOffset);
    const prefilterMapOffset = PrefilterMap.endPrefilterMap(builder);

    HdrAsset.startHdrAsset(builder);
    HdrAsset.addEnviromentMap(builder, envMapOffset);
    HdrAsset.addIrradianceMap(builder, irradianceMapOffset);
    HdrAsset.addPrefilterMap(builder, prefilterMapOffset);
    const hdrAssetOffset = HdrAsset.endHdrAsset(builder);
    builder.finish(hdrAssetOffset);

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
        data: getUint8Array(image.dataArray())
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
        const rawIndices = prim.indicesArray();
        if(!rawIndices) continue;
        let indexType = prim.indexType();
        let indices: Uint8Array | Uint16Array | Uint32Array;
        if(indexType === IndexType.UNSIGNED_BYTE){
            indices = new Uint8Array(
                rawIndices.buffer,
                rawIndices.byteOffset,
                rawIndices.byteLength
            );
            indices = new Uint8Array(rawIndices);
        }
        else if(indexType === IndexType.UNSIGNED_SHORT){
            indices = new Uint16Array(
                rawIndices.buffer,
                rawIndices.byteOffset,
                rawIndices.byteLength / 2
            );
            indices = new Uint16Array(indices);
        }
        else if(indexType === IndexType.UNSIGNED_INT){
            indices = new Uint32Array(
                rawIndices.buffer,
                rawIndices.byteOffset,
                rawIndices.byteLength / 4
            );
            indices = new Uint32Array(indices);
        }
        else{
            indices = new Uint32Array();
            indexType = IndexType.UNSIGNED_INT;
        }
        asset.primitives.push({
            attribute: {
                interleaveArray: getFloat32Array(attr.interleaveArrayArray())
            },
            indices,
            indexType,
            drawMode: prim.drawMode(),
        });
    }
    return asset;
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
        maxShininess: prefilterMap.maxShininess(),
        mipMapCount: prefilterMap.mipMapCount(),
        mipMaps: mipMapOuts
    }
    
    const asset: ShotEngineType.HdrAsset = {
        enviromentMap: envMapOut,
        irradianceMap: irradianceMapOut,
        prefilterMap: prefilterMapOut
    }

    return asset;
}
