import { NodeIO, Node, Texture, Mesh, Accessor } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from "node:path";
import * as ShotEngineType from "@shot-engine/types";
import { imageToRaw } from './imageToRaw';
import { v4 as uuidv4 } from "uuid";

type GLB = {
    textures: GLBTexture[],
    meshes: GLBMesh[],
    prefabAssets: ShotEngineType.PrefabAsset[],
    mats: MatInfo[]
}
type GLBTexture = {
    name: string,
    imageAsset: ShotEngineType.ImageAsset
}
type GLBMesh = {
    name: string,
    meshAsset: ShotEngineType.MeshAsset
}
type MatInfo = {
    name: string,
    info: string
}

// readGLBFile(path.join(process.cwd(), "test", "Cube.glb"));
export async function readGLBFile(filePath: string){
    const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({});

    const document = await io.read(filePath);
    const root = document.getRoot();
    
    // set id for all node
    for(const node of root.listNodes()){
        node.setExtras({ id: uuidv4() })
    }

    // for(const skin of root.listSkins()){
    //     console.log(`--- Skin: ${skin.getName()} ---`);

    //     const joints = skin.listJoints();
    //     console.log(joints);

        // const rootJoint = skin.getSkeleton() || joints[0];
        // if(!rootJoint) continue;
        // console.log(`Skeleton Root: ${rootJoint.getName()}`);
        
        // for (const joint of joints) {
        //     console.log(`Bone Node: ${joint.getName()}`);
        // }
    // }

    // function getNodePath(nodeIn?: Node | null){
    //     const names: string[] = [];
    //     let isSkin = false;
    //     function recur(node?: Node | null){
    //         if(!node) return;
    //         const skin = node.getSkin();
    //         if(skin){
    //             console.log("aa");
    //             isSkin = true;
    //             return;
    //         }
    //         names.unshift(node.getName());
    //         recur(node.getParentNode());
    //     }
    //     recur(nodeIn);
    //     if(!isSkin) return "/";
    //     return "/" + names.join("/");
    // }
    // for(const ani of root.listAnimations()){
    //     console.log(`--- Animation: ${ani.getName()} ---`);
    //     for(const channel of ani.listChannels()){
    //         const targetNode = channel.getTargetNode();
    //         console.log("child path: ", targetNode?.getName());

    //         const targetPath = channel.getTargetPath();
    //         // console.log(`Target: ${targetNode ? targetNode.getName() : 'Unknown'} | Path: ${targetPath}`);
    //         const sampler = channel.getSampler();
    //         const times = sampler?.getInput()?.getArray();
    //         const values = sampler?.getOutput()?.getArray();
    //         // console.log(times, values);
    //     }
    // }
    
    const glb: GLB = {
        textures: [],
        meshes: [],
        prefabAssets: [],
        mats: []
    };
    const textureNameMap = new Map<Texture, string>();
    for(let i = 0; i < root.listTextures().length; i++){
        const texture = root.listTextures()[i];
        const textureName = "tex" + i;
        textureNameMap.set(texture, textureName);

        const image = texture.getImage();
        const raw = await imageToRaw(image ?? new Uint8Array());
        glb.textures.push({
            name: textureName,
            imageAsset: {
                width: raw.info.width,
                height: raw.info.height,
                data: raw.data
            }
        });
    }
    for(const material of root.listMaterials()){
        let info = "";
        const baseColor = material.getBaseColorTexture();
        const normal = material.getNormalTexture();
        const metallicRoughness = material.getMetallicRoughnessTexture();
        const emissive = material.getEmissiveTexture();
        const occlusion = material.getOcclusionTexture();
        if(baseColor && textureNameMap.has(baseColor)){
            info += `baseColor: ${textureNameMap.get(baseColor)}\n`;
        }
        if(metallicRoughness && textureNameMap.has(metallicRoughness)){
            info += `metallicRoughness: ${textureNameMap.get(metallicRoughness)}\n`;
        }
        if(emissive && textureNameMap.has(emissive)){
            info += `emissive: ${textureNameMap.get(emissive)}\n`;
        }
        if(occlusion && textureNameMap.has(occlusion)){
            info += `occlusion: ${textureNameMap.get(occlusion)}\n`;
        }
        if(normal && textureNameMap.has(normal)){
            info += `normal: ${textureNameMap.get(normal)}\n`;
        }
        glb.mats.push({
            name: material.getName(),
            info
        });
    }
    for(const mesh of root.listMeshes()){
        const primitives = mesh.listPrimitives().map((e => {
            const indices = getIndices(e.getIndices());
            let indexType = 0;
            if(indices instanceof Uint8Array) indexType = 5121;
            if(indices instanceof Uint16Array) indexType = 5123;
            if(indices instanceof Uint32Array) indexType = 5125;

            const positions = getAttr(e.getAttribute("POSITION")); // vec3
            const normals = getAttr(e.getAttribute("NORMAL")); // vec3
            const uvs = getAttr(e.getAttribute("TEXCOORD_0")); // vec2

            const weights = getAttr(e.getAttribute("WEIGHTS_0")); // vec4
            const joints = getAttrUint8(e.getAttribute("JOINTS_0")); // vec4
            let invBindPoseMatrices: Float32Array = new Float32Array();
            // many nodes use 1 mesh, those node share same skin
            const parentNode = mesh.listParents().find(p => p instanceof Node);
            const skin = parentNode?.getSkin();
            if(skin){
                invBindPoseMatrices = getAttr(skin.getInverseBindMatrices());
            }
            
            const interleaveArray = createInterleaveArr(positions, normals, uvs); // new buffer
            const interleaveArrayWithTangent = ShotEngineType.MeshHelper.InterleaveArrayTangent(
                interleaveArray, indices
            ); // new buffer
            const interleaveArrayWithJoint = extendInterleaveArr(
                interleaveArrayWithTangent, weights, joints
            );

            const primitive: ShotEngineType.MeshAsset["primitives"][0] = {
                type: joints.length === 0 ? "static" : "skin",
                attribute: {
                    interleaveArray: interleaveArrayWithJoint
                },
                indices,
                indexType,
                drawMode: e.getMode(),
                aabb: ShotEngineType.AABB.FromVertices([...positions]),
                invBindPoseMatrices
            }
            return primitive;
        }));
        glb.meshes.push({
            name: mesh.getName(),
            meshAsset: { primitives } 
        });
    }

    const textureMap = new Map<Texture, number>(root.listTextures().map((e, idx) => [e, idx]));
    const meshMap = new Map<Mesh, number>(root.listMeshes().map((e, idx) => [e, idx]));
    const scene = root.getDefaultScene();
    if(!scene) return;
    for(const node of scene.listChildren()){
        const prefabAsset: ShotEngineType.PrefabAsset = {
            root: createGameObject(node, meshMap)
        }
        glb.prefabAssets.push(prefabAsset);
    }

    return glb;
}
function getAttr(attr?: Accessor | null){
    const array = attr?.getArray();
    let result: Float32Array;
    if(!array){
        result = new Float32Array();
    }
    else{
        if(array instanceof Float32Array){
            result = array;
        }
        else{
            result = new Float32Array();
        }
    }
    return result;
}
function getAttrUint8(attr?: Accessor | null){
    const array = attr?.getArray();
    let result: Uint8Array;
    if(!array){
        result = new Uint8Array();
    }
    else{
        if(array instanceof Uint8Array){
            result = array;
        }
        else{
            result = new Uint8Array();
        }
    }
    return result;
}
function getIndices(attr?: Accessor | null){
    const array = attr?.getArray();
    let result: Uint8Array | Uint16Array | Uint32Array;
    if(!array){
        result = new Uint32Array();
    }
    else{
        if(
            array instanceof Uint8Array ||
            array instanceof Uint16Array ||
            array instanceof Uint32Array
        ){
            result = array;
        }
        else{
            result = new Uint32Array();
        }
    }
    return result;
}
function createInterleaveArr(positions: Float32Array, normals: Float32Array, uvs: Float32Array){
    const vertexCount = positions.length / 3;
    if(normals.length !== positions.length) throw "Positions and Normals mismatch";
    if(uvs.length !== vertexCount * 2) throw "UV count mismatch";

    const interleaveBuffer = new Float32Array(vertexCount * (3 + 3 + 2));
    for(let i = 0; i < vertexCount; i++){
        const i3 = i * 3;
        const i2 = i * 2;
        const i8 = i * 8;
        interleaveBuffer[i8 + 0] = positions[i3 + 0];
        interleaveBuffer[i8 + 1] = positions[i3 + 1];
        interleaveBuffer[i8 + 2] = positions[i3 + 2];
        interleaveBuffer[i8 + 3] = normals[i3 + 0];
        interleaveBuffer[i8 + 4] = normals[i3 + 1];
        interleaveBuffer[i8 + 5] = normals[i3 + 2];
        interleaveBuffer[i8 + 6] = uvs[i2 + 0];
        interleaveBuffer[i8 + 7] = uvs[i2 + 1];
    }

    return interleaveBuffer;
}
function extendInterleaveArr(
    interleaveArray: Float32Array, // pos 3, normal 3, uv 2, tangent 3
    weights: Float32Array, joints: Uint8Array // weight 4 float joint 4 uint
){
    if(joints.length === 0) return new Uint8Array(interleaveArray.buffer);
    // create interleaveBuffer
    // (pos 12bytes + normal 12bytes + uv 8bytes + tangent 12bytes) 44
    // (weights 16bytes joint 4bytes) 20
    const vertexCount = Math.floor(interleaveArray.length / 11);
    const buffer = new ArrayBuffer(64 * vertexCount);
    const floatView = new Float32Array(buffer);
    const uint8View = new Uint8Array(buffer);
    let floatIdx = 0;
    let interleaveArrayIdx = 0;
    let weightIdx = 0;
    let jointIdx = 0;
    for(let i = 0; i < vertexCount; i++){
        floatView.set(
            interleaveArray.subarray(interleaveArrayIdx, interleaveArrayIdx + 11),
            floatIdx
        );
        interleaveArrayIdx += 11;
        floatIdx += 11;

        floatView.set(weights.subarray(weightIdx, weightIdx + 4), floatIdx);
        weightIdx += 4;
        floatIdx += 4;

        uint8View.set(joints.subarray(jointIdx, jointIdx + 4), floatIdx * 4);
        jointIdx += 4;
        floatIdx += 1;
    }
    return new Uint8Array(buffer);
}
function createGameObject(node: Node, meshMap: Map<Mesh, number>){
    node.getRotation()
    let gameObject: ShotEngineType.GameObject = {
        id: node.getExtras()["id"] as string,
        name: node.getName(),
        components: [],
        childs: []
    };
    gameObject.components.push(
        {
            type: "Transform",
            id: "",
            pos: {
                x: node.getTranslation()[0],
                y: node.getTranslation()[1],
                z: node.getTranslation()[2]
            },
            rot: {
                x: node.getRotation()[0],
                y: node.getRotation()[1],
                z: node.getRotation()[2],
                w: node.getRotation()[3]
            },
            scale: {
                x: node.getScale()[0],
                y: node.getScale()[1],
                z: node.getScale()[2]
            },
            editor: {
                euler: quatToEulerYXZ(node.getRotation())
            }
        }
    );
    const mesh = node.getMesh();
    const skin = node.getSkin();
    if(mesh && skin){
        const rootJoint = skin.listJoints()[0];
        if(rootJoint){
            gameObject.components.push({
                type: "Skeleton",
                id: uuidv4(),
                rootJointId: rootJoint.getExtras()["id"] as string
            });
        }
    }
    if(mesh){
        let meshIndex = meshMap.get(mesh);
        if(meshIndex === undefined) meshIndex = -1;
        gameObject.components.push(
            {
                type: "Mesh",
                id: uuidv4(),
                meshRef: meshIndex as any
            },
            {
                type: "Shading",
                shaderType: "simple",
                id: uuidv4(),
                culling: "none",
                transparent: false,
                color: { x: 1, y: 1, z: 1 }
            }
        );
    }
    for(const child of node.listChildren()){
        gameObject.childs.push(
            createGameObject(child, meshMap)
        );
    }

    return gameObject;
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
    return {
        x: pitchX * (180 / Math.PI),
        y: yawY * (180 / Math.PI), 
        z: rollZ * (180 / Math.PI)
    };
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

  return {
    x: pitchX * (180 / Math.PI),
    y: yawY * (180 / Math.PI), 
    z: rollZ * (180 / Math.PI)
  }; // radians
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
