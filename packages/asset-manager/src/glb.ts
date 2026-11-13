import { NodeIO, Node, Texture, Mesh, Material, vec4, vec3, GLTF, Primitive, Skin, TextureInfo } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { normals, unweld, tangents, weld } from "@gltf-transform/functions";
import { generateTangents } from 'mikktspace';
import path from "node:path";
import * as ShotEngineType from "@shot-engine/types";
import { v4 as uuidv4 } from "uuid";
import * as math from "@shot-engine/math";

type GLB = {
    meshAssets: Map<string, GLBMesh>,
    imageAssets: Map<string, GLBImage>,
    materialAssets: Map<string, GLBMaterial>,
    prefabAssets: GLBPrefab[],
}
type GLBMesh = {
    name: string,
    meshAsset: ShotEngineType.MeshAsset,
}
type GLBImage = {
    name: string,
    raw: Uint8Array<ArrayBufferLike>,
    property: ShotEngineType.AssetProperty.Image
}
type GLBMaterial = {
    name: string,
    materialAsset: ShotEngineType.MaterialAsset,
}
type GLBPrefab = {
    name: string,
    prefabAsset: ShotEngineType.PrefabAsset
}

// readGLBFile(path.join(process.cwd(), "test", "Cube.glb"));
export async function readGLBFile(filePath: string){
    const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({});

    const document = await io.read(filePath);
    await document.transform(normals({ overwrite: false }));
    await document.transform(unweld());
    await document.transform(
        tangents({generateTangents})
    );
    await document.transform(weld());
    const root = document.getRoot();
    
    // set ids
    for(const node of root.listNodes()){
        node.setExtras({ id: uuidv4() });
    }
    for(const mesh of root.listMeshes()){
        mesh.setExtras({ id: uuidv4() });
    }
    for(const material of root.listMaterials()){
        material.setExtras({ id: uuidv4() });
    }
    for(const texture of root.listTextures()){
        texture.setExtras({ id: uuidv4() });
    }
    
    // glb
    const glb: GLB = {
        meshAssets: new Map(),
        materialAssets: new Map(),
        imageAssets: new Map(),
        prefabAssets: [],
    };

    // helpers
    let iTexName = 0;
    let iMatName = 0;
    let iMeshName = 0;
    const getImage = async (texture: Texture) => {
        const image = texture.getImage();
        if(!image) throw "bad glb: missing texture image";
        return image;
    }
    const getTextureName = (texture: Texture) => {
        let name = texture.getName();
        const ext = path.basename(texture.getMimeType());
        if(name) return `${name}.${ext}`;
        name = `image-${iTexName}.${ext}`;
        iTexName++;
        return name;
    }
    const tryCreateGLBImageAsset = async (
        texture: Texture | null, info: TextureInfo | null, isNormal: boolean, sRGB: boolean
    ) => {
        if(!texture) return;
        const assetId = texture.getExtras()["id"] as string;
        if(glb.imageAssets.has(assetId)) return assetId;
        const createProperty = () => {
            const property: ShotEngineType.AssetProperty.Image = {
                type: "image",
                imageType: isNormal ? "NormalMap" : "Texture",
                flipY: false,
                sRGB,
                generateMipmaps: true,
                wrapModeS: "REPEAT",
                wrapModeT: "REPEAT",
                filterMode: "LINEAR"
            }
            if(!info) return property;
            property.wrapModeS = getWrapMode(info.getWrapS());
            property.wrapModeT = getWrapMode(info.getWrapT());
            const magFilter = info.getMagFilter();
            if(magFilter && magFilter === 9728) property.filterMode = "NONE";
            if(magFilter && magFilter === 9729) property.filterMode = "LINEAR";
            return property;
        }
        glb.imageAssets.set(assetId, {
            name: getTextureName(texture),
            raw: await getImage(texture),
            property: createProperty()
        });
        return assetId;
    }
    const createMaterialAsset = async (material: Material) => {
        const materialAsset: ShotEngineType.MaterialAsset = {
            matType: "pbr",
            culling: material.getDoubleSided() ? "none" : "back",
            transparent: getTransparent(material.getAlphaMode()),
            alphaCutoff: material.getAlphaCutoff(),
            baseFactor: getVec4(material.getBaseColorFactor()),
            baseTextureRef: await tryCreateGLBImageAsset(
                material.getBaseColorTexture(),
                material.getBaseColorTextureInfo(), false, true
            ),
            roughnessFactor: material.getRoughnessFactor(),
            metallicFactor: material.getMetallicFactor(),
            metallicRoughnessTextureRef: await tryCreateGLBImageAsset(
                material.getMetallicRoughnessTexture(),
                material.getMetallicRoughnessTextureInfo(), false, false
            ),
            normalScale: material.getNormalScale(),
            normalTextureRef: await tryCreateGLBImageAsset(
                material.getNormalTexture(),
                material.getNormalTextureInfo(), true, false
            ),
            emissitveFactor: getVec3(material.getEmissiveFactor()),
            emissiveTextureRef: await tryCreateGLBImageAsset(
                material.getEmissiveTexture(),
                material.getEmissiveTextureInfo(), false, true
            ),
            occlusionStrength: material.getOcclusionStrength(),
            occlusionTextureRef: await tryCreateGLBImageAsset(
                material.getOcclusionTexture(),
                material.getOcclusionTextureInfo(), false, false
            ),
        }
        return materialAsset;
    }
    const getMaterialName = (material: Material) => {
        let name = material.getName();
        if(name) return `${name}.mat`;
        name = `mat-${iMatName}.mat`;
        iMatName++;
        return name;
    }
    const tryCreateGLBMaterialAsset = async (material: Material) => {
        const assetId = material.getExtras()["id"] as string;
        if(glb.materialAssets.has(assetId)) return assetId;
        glb.materialAssets.set(assetId, {
            name: getMaterialName(material),
            materialAsset: await createMaterialAsset(material),
        });
        return assetId;
    }
    const materialRefsFromMesh = async (mesh: Mesh) => {
        const materialRefs: string[] = [];
        for(const primitive of mesh.listPrimitives()){
            const material = primitive.getMaterial();
            if(!material) continue;
            materialRefs.push(
                await tryCreateGLBMaterialAsset(material)
            );
        }
        return materialRefs;
    }
    const createMeshAsset = (mesh: Mesh, skin?: Skin | null) => {
        const meshAsset: ShotEngineType.MeshAsset = {
            primitives: [],
            invBindPoseMatrices: new Float32Array()
        }
        for(const primitive of mesh.listPrimitives()){
            const [indices, indexType, indexCount] = getIndices(primitive);
            const positions = getAttribute(primitive, "POSITION"); // vec3
            const normals = getAttribute(primitive, "NORMAL"); // vec3
            const uvs = getAttribute(primitive, "TEXCOORD_0"); // vec2
            const tangents = getAttribute(primitive, "TANGENT"); // vec4
            let attribute: ShotEngineType.MeshAsset["primitives"][0]["attribute"];
            if(!skin){
                const interleaveArray = createInterleaveArr(positions, normals, uvs, tangents);
                attribute = {
                    interleaveArray,
                    position: positions,
                    normal: normals,
                    uv: uvs,
                    tangent: tangents,
                    joint: { type: -1, normalized: false, itemSize: 0, count: 0 },
                    weight: { type: -1, normalized: false, itemSize: 0, count: 0 },
                }
            }
            else{
                const joints = getAttribute(primitive, "JOINTS_0"); // vec4
                const weights = getAttribute(primitive, "WEIGHTS_0"); // vec4
                const interleaveArray = createSkinInterleaveArr(
                    positions, normals, uvs, tangents, joints, weights
                );
                attribute = {
                    interleaveArray,
                    position: positions,
                    normal: normals,
                    uv: uvs,
                    tangent: tangents,
                    joint: joints,
                    weight: weights,
                }
            }
            meshAsset.primitives.push({
                indices,
                attribute,
                indexType,
                indexCount,
                drawMode: primitive.getMode(),
                aabb: ShotEngineType.AABB.FromVertices([...new Float32Array(positions.buffer.buffer)]),
            });
        }
        if(skin){
            const invBindPoseMatrices = skin.getInverseBindMatrices()?.getArray();
            if(!invBindPoseMatrices) throw "bad glb: missing invBindPoseMatrices"
            meshAsset.invBindPoseMatrices = new Float32Array(invBindPoseMatrices); // copy
        }
        return meshAsset;
    }
    const getMeshName = (mesh: Mesh) => {
        let name = mesh.getName();
        if(name) return `${name}.mesh`;
        name = `mesh-${iMeshName}.mesh`;
        iMeshName++;
        return name;
    }
    const tryCreateGLBMeshAsset = (mesh: Mesh, skin?: Skin | null) => {
        const assetId = mesh.getExtras()["id"] as string;
        if(glb.meshAssets.has(assetId)) return assetId;
        glb.meshAssets.set(assetId, {
            name: getMeshName(mesh),
            meshAsset: createMeshAsset(mesh, skin),
        });
        return assetId;
    }

    // create components + gameobjects
    const createDefaultTransformComponent = () => {
        const transformComponent: ShotEngineType.Transform = {
            type: "Transform",
            id: uuidv4(),
            pos: math.Vec3.FromValues(0, 0, 0),
            rot: math.Quat.FromValues(0, 0, 0, 1),
            scale: math.Vec3.FromValues(1, 1, 1),
            editor: {
                euler: quatToEulerYXZ([0, 0, 0, 1])
            }
        }
        return transformComponent;
    }
    const createTransformComponent = (node: Node) => {
        const transformComponent: ShotEngineType.Transform = {
            type: "Transform",
            id: uuidv4(),
            pos: math.Vec3.FromValues(
                node.getTranslation()[0],
                node.getTranslation()[1],
                node.getTranslation()[2]
            ),
            rot: math.Quat.FromValues(
                node.getRotation()[0],
                node.getRotation()[1],
                node.getRotation()[2],
                node.getRotation()[3]
            ),
            scale: math.Vec3.FromValues(
                node.getScale()[0],
                node.getScale()[1],
                node.getScale()[2]
            ),
            editor: {
                euler: quatToEulerYXZ(node.getRotation())
            }
        }
        return transformComponent;
    }
    const createMeshRendererComponent = async (mesh: Mesh) => {
        const meshRendererComponent: ShotEngineType.MeshRenderer = {
            id: uuidv4(),
            type: "MeshRenderer",
            meshRef: tryCreateGLBMeshAsset(mesh),
            materialRefs: await materialRefsFromMesh(mesh),
        }
        return meshRendererComponent;
    }
    const createSkinnedMeshRendererComponent = async (mesh: Mesh, skin: Skin) => {
        const skinnedMeshRendererComponent: ShotEngineType.SkinnedMeshRenderer = {
            id: uuidv4(),
            type: "SkinnedMeshRenderer",
            meshRef: tryCreateGLBMeshAsset(mesh, skin),
            materialRefs: await materialRefsFromMesh(mesh),
            jointRefs: skin.listJoints().map(j => j.getExtras()["id"] as string),
        }
        return skinnedMeshRendererComponent;
    }
    const createGameObject = async (node: Node) => {
        const go: ShotEngineType.GameObject = {
            id: node.getExtras()["id"] as string,
            name: node.getName(),
            components: [createTransformComponent(node)],
            childs: []
        }

        // add mesh component
        const mesh = node.getMesh();
        if(mesh){
            const skin = node.getSkin();
            if(!skin) go.components.push(await createMeshRendererComponent(mesh));
            else go.components.push(await createSkinnedMeshRendererComponent(mesh, skin));
        }

        // recursive
        for(const childNode of node.listChildren()){
            go.childs.push(await createGameObject(childNode));
        }
        return go;
    }

    // each scene -> one prefab
    for(const scene of root.listScenes()){
        const prefabAsset: ShotEngineType.PrefabAsset = {
            root: {
                id: uuidv4(),
                name: scene.getName() || path.parse(filePath).name,
                components: [createDefaultTransformComponent()],
                childs: []
            }
        }
        for(const node of scene.listChildren()){
            const child = await createGameObject(node);
            prefabAsset.root.childs.push(child);
        }
        glb.prefabAssets.push({
            name: prefabAsset.root.name + ".prefab",
            prefabAsset
        });
    }

    return glb;
}

function getVec4(vec4: vec4){
    return math.Vec4.FromValues(vec4[0], vec4[1], vec4[2], vec4[3]);
}
function getVec3(vec3: vec3){
    return math.Vec3.FromValues(vec3[0], vec3[1], vec3[2]);
}
function getTransparent(alphaMode: GLTF.MaterialAlphaMode): ShotEngineType.BaseMaterialAsset["transparent"]{
    if(alphaMode === "OPAQUE") return "opaque";
    if(alphaMode === "MASK") return "mask";
    if(alphaMode === "BLEND") return "blend";
    return "opaque";
}
function getWrapMode(wrapMode: GLTF.TextureWrapMode): ShotEngineType.AssetProperty.Image["wrapModeS"]{
    if(wrapMode === 33071){
        return "CLAMP";
    }
    if(wrapMode === 33648){
        return "MIRROR";
    }
    return "REPEAT";
}
function getIndices(primitive: Primitive){
    const accessor = primitive.getIndices();
    if(!accessor) throw `bad glb: missing indices`;
    const array = accessor.getArray();
    if(!array) throw `bad glb: missing indices`;
    // copy
    const indices = new Uint8Array(array.byteLength);
    indices.set(new Uint8Array(array.buffer));
    return [indices, accessor.getComponentType() as number, accessor.getCount()] as const;
}
function getAttribute(primitive: Primitive, name: string){
    const accessor = primitive.getAttribute(name);
    if(!accessor) throw `bad glb: missing attribute ${name}`;
    const array = accessor.getArray();
    if(!array) throw `bad glb: missing attribute ${name}`;
    // copy
    const buffer = new Uint8Array(array.byteLength);
    buffer.set(new Uint8Array(array.buffer));
    return {
        buffer,
        itemSize: accessor.getElementSize() * accessor.getComponentSize(),
        type: accessor.getComponentType() as number,
        normalized: accessor.getNormalized(),
        count: accessor.getCount(),
    };
}
function createInterleaveArr(
    positions: ReturnType<typeof getAttribute>,
    normals: ReturnType<typeof getAttribute>,
    uvs: ReturnType<typeof getAttribute>,
    tangents: ReturnType<typeof getAttribute>,
){
    const vertexCount = positions.buffer.byteLength / positions.itemSize;
    const normalCount = normals.buffer.byteLength / normals.itemSize;
    const uvCount = uvs.buffer.byteLength / uvs.itemSize;
    const tangentCount = tangents.buffer.byteLength / tangents.itemSize;
    if(normalCount !== vertexCount) throw "normal count mismatch";
    if(uvCount !== vertexCount) throw "uv count mismatch";
    if(tangentCount !== vertexCount) throw "tangent count mismatch";

    const buffer = new ArrayBuffer(
        positions.buffer.byteLength + normals.buffer.byteLength + 
        uvs.buffer.byteLength + tangents.buffer.byteLength
    );
    const interleaveBuffer = new Uint8Array(buffer);
    let itemOffset = 0;
    let posOffset = 0;
    let normalOffset = 0;
    let uvOffset = 0;
    let tangentOffset = 0;
    for(let i = 0; i < vertexCount; i++){
        interleaveBuffer.set(positions.buffer.subarray(posOffset, posOffset + positions.itemSize), itemOffset);
        itemOffset += positions.itemSize;
        interleaveBuffer.set(normals.buffer.subarray(normalOffset, normalOffset + normals.itemSize), itemOffset);
        itemOffset += normals.itemSize;
        interleaveBuffer.set(uvs.buffer.subarray(uvOffset, uvOffset + uvs.itemSize), itemOffset);
        itemOffset += uvs.itemSize;
        interleaveBuffer.set(tangents.buffer.subarray(tangentOffset, tangentOffset + tangents.itemSize), itemOffset);
        itemOffset += tangents.itemSize;

        posOffset += positions.itemSize;
        normalOffset += normals.itemSize;
        uvOffset += uvs.itemSize;
        tangentOffset += tangents.itemSize;
    }
    return interleaveBuffer;
}
function createSkinInterleaveArr(
    positions: ReturnType<typeof getAttribute>,
    normals: ReturnType<typeof getAttribute>,
    uvs: ReturnType<typeof getAttribute>,
    tangents: ReturnType<typeof getAttribute>,
    joints: ReturnType<typeof getAttribute>,
    weights: ReturnType<typeof getAttribute>,
){
    const vertexCount = positions.buffer.byteLength / positions.itemSize;
    const normalCount = normals.buffer.byteLength / normals.itemSize;
    const uvCount = uvs.buffer.byteLength / uvs.itemSize;
    const tangentCount = tangents.buffer.byteLength / tangents.itemSize;
    const jointCount = joints.buffer.byteLength / joints.itemSize;
    const weightCount = weights.buffer.byteLength / weights.itemSize;
    if(normalCount !== vertexCount) throw "normal count mismatch";
    if(uvCount !== vertexCount) throw "uv count mismatch";
    if(tangentCount !== vertexCount) throw "tangent count mismatch";
    if(jointCount !== vertexCount) throw "joint count mismatch";
    if(weightCount !== vertexCount) throw "weight count mismatch";

    const buffer = new ArrayBuffer(
        positions.buffer.byteLength + normals.buffer.byteLength + 
        uvs.buffer.byteLength + tangents.buffer.byteLength +
        joints.buffer.byteLength + weights.buffer.byteLength
    );
    const interleaveBuffer = new Uint8Array(buffer);
    let itemOffset = 0;
    let posOffset = 0;
    let normalOffset = 0;
    let uvOffset = 0;
    let tangentOffset = 0;
    let jointOffset = 0;
    let weightOffset = 0;
    for(let i = 0; i < vertexCount; i++){
        interleaveBuffer.set(positions.buffer.subarray(posOffset, posOffset + positions.itemSize), itemOffset);
        itemOffset += positions.itemSize;
        interleaveBuffer.set(normals.buffer.subarray(normalOffset, normalOffset + normals.itemSize), itemOffset);
        itemOffset += normals.itemSize;
        interleaveBuffer.set(uvs.buffer.subarray(uvOffset, uvOffset + uvs.itemSize), itemOffset);
        itemOffset += uvs.itemSize;
        interleaveBuffer.set(tangents.buffer.subarray(tangentOffset, tangentOffset + tangents.itemSize), itemOffset);
        itemOffset += tangents.itemSize;
        interleaveBuffer.set(joints.buffer.subarray(jointOffset, jointOffset + joints.itemSize), itemOffset);
        itemOffset += joints.itemSize;
        interleaveBuffer.set(weights.buffer.subarray(weightOffset, weightOffset + weights.itemSize), itemOffset);
        itemOffset += weights.itemSize;

        posOffset += positions.itemSize;
        normalOffset += normals.itemSize;
        uvOffset += uvs.itemSize;
        tangentOffset += tangents.itemSize;
        jointOffset += joints.itemSize;
        weightOffset += weights.itemSize;
    }
    return interleaveBuffer;
}
function quatToEulerYXZ(q: [number, number, number, number]) {
  const [x, y, z, w] = q;

  // X (pitch)
  const t = 2 * (w * x - y * z);
  const clamped = Math.max(-1, Math.min(1, t));
  const pitchX = Math.asin(clamped);

  // Check gimbal lock
  if (Math.abs(clamped) > 0.999999) {
    // Gimbal lock
    const yawY = Math.atan2(
      -2 * (w * z - x * y),
      1 - 2 * (x * x + z * z)
    );
    const rollZ = 0;
    return math.Vec3.FromValues(
        pitchX * (180 / Math.PI),
        yawY * (180 / Math.PI), 
        rollZ * (180 / Math.PI)
    );
  }

  // Y (yaw)
  const yawY = Math.atan2(
    2 * (w * y + x * z),
    1 - 2 * (x * x + y * y)
  );

  // Z (roll)
  const rollZ = Math.atan2(
    2 * (w * z + x * y),
    1 - 2 * (x * x + z * z)
  );

  return math.Vec3.FromValues(
    pitchX * (180 / Math.PI),
    yawY * (180 / Math.PI), 
    rollZ * (180 / Math.PI)
  ); // radians
}

function printNode(node: Node, space = 0){
    let sp = "";
    for(let i = 0; i < space; i++) sp += "  ";

    console.log(sp, "-", node.getName());
    console.log(sp, "Transforms:", node.getTranslation(), node.getRotation(), node.getScale());
    const mesh = node.getMesh();
    if(mesh){
        console.log(sp, "Mesh:", mesh.getName());
        for(const prim of mesh.listPrimitives()){
            console.log(sp, prim.getName());
            console.log(sp, prim.getAttribute("POSITION")?.getArray());
            console.log(sp, prim.getIndices()?.getArray());
        }
    }

    for(const childNode of node.listChildren()){
        printNode(childNode, space + 1);
    }
}
