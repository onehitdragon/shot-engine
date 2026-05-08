import { NodeIO, Node, Texture, Mesh, Accessor } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from "node:path";
import * as ShotEngineType from "@shot-engine/types";
import { imageToRaw } from './imageToRaw';

type GLB = {
    textures: GLBTexture[],
    meshes: GLBMesh[],
    prefabAssets: ShotEngineType.PrefabAsset[]
}
type GLBTexture = {
    name: string,
    imageAsset: ShotEngineType.ImageAsset
}
type GLBMesh = {
    name: string,
    meshAsset: ShotEngineType.MeshAsset
}

// readGLBFile(path.join(process.cwd(), "test", "ark-rm", "Untitled2.glb"));
export async function readGLBFile(filePath: string){
    const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({});

    const document = await io.read(filePath);
    const root = document.getRoot();
    
    const glb: GLB = {
        textures: [],
        meshes: [],
        prefabAssets: []
    };
    for(const texture of root.listTextures()){
        const image = texture.getImage();
        const raw = await imageToRaw(image ?? new Uint8Array());
        glb.textures.push({
            name: texture.getName(),
            imageAsset: {
                width: raw.info.width,
                height: raw.info.height,
                data: raw.data
            }
        });
    }
    for(const mesh of root.listMeshes()){
        const primitives = mesh.listPrimitives().map((e => {
            const positions = getAttr(e.getAttribute("POSITION"));
            const normals = getAttr(e.getAttribute("NORMAL"));
            const uvs = getAttr(e.getAttribute("TEXCOORD_0"));
            const indices = getIndices(e.getIndices());
            let indexType = 0;
            if(indices instanceof Uint8Array) indexType = 5121;
            if(indices instanceof Uint16Array) indexType = 5123;
            if(indices instanceof Uint32Array) indexType = 5125;
            const primitive: ShotEngineType.MeshAsset["primitives"][0] = {
                attribute: {
                    interleaveArray: createInterleaveArr(positions, normals, uvs)
                },
                indices,
                indexType,
                drawMode: e.getMode()
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
function createInterleaveArr(
    positions: Float32Array, normals: Float32Array, uvs: Float32Array
){
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
function createGameObject(node: Node, meshMap: Map<Mesh, number>){
    node.getRotation()
    let gameObject: ShotEngineType.GameObject = {
        id: "",
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
    if(mesh){
        let meshIndex = meshMap.get(mesh);
        if(meshIndex === undefined) meshIndex = -1;
        gameObject.components.push(
            {
                type: "Mesh",
                id: "",
                meshRef: meshIndex as any
            },
            {
                type: "Shading",
                shaderType: "simple",
                id: "",
                culling: "none",
                transparent: false
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
