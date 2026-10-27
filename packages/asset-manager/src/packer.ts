import path from "node:path";
import { getConfig } from "./assetManager.js";
import fsExtra from "fs-extra";
import * as ShotEngineType from "@shot-engine/types";
import { readPrefabAsset, readSceneAsset } from "./flatbf.js";

export async function pack(projectSetting: ShotEngineType.ProjectSettingAsset){
  const { BUILD_DIR, ASSET_GENERATED_DIR } = getConfig();
  await fsExtra.ensureDir(BUILD_DIR);
  await fsExtra.emptyDir(BUILD_DIR);

  // --buid dependencyMap
  const getResourcePath = (uuid: string) => path.join(ASSET_GENERATED_DIR, uuid);
  const dependencyMap = new Map<
    string, { type: ShotEngineType.AssetType, resourcePath: string }
  >();
  const addDependency = (uuid: string, type: ShotEngineType.AssetType) => {
    dependencyMap.set(uuid, { type,  resourcePath: getResourcePath(uuid) });
  }
  const nodeRecur = (node: ShotEngineType.SceneNode) => {
    if(ShotEngineType.isGameObjectPrefab(node)){
      const { prefabRef } = node;
      addDependency(prefabRef, "prefab");
      const prefabAsset = readPrefabAsset(getResourcePath(prefabRef));
      if(!prefabAsset) throw "error: readPrefabAsset";
      nodeRecur(prefabAsset.root);
    }
    else{
      for(const component of node.components){
        if(component.type === "Mesh"){
          const { meshRef } = component;
          addDependency(meshRef, "mesh");
        }
        if(component.type === "Shading" && component.shaderType === "pbr"){
          const { diffuse, metallic, roughness, normal, ao } = component;
          if(diffuse.type === "image"){
            addDependency(diffuse.imageRef, "image");
          }
          if(metallic.type === "image"){
            addDependency(metallic.imageRef, "image");
          }
          if(roughness.type === "image"){
            addDependency(roughness.imageRef, "image");
          }
          if(normal.type === "image"){
            addDependency(normal.imageRef, "image");
          }
          if(ao.type === "image"){
            addDependency(ao.imageRef, "image");
          }
        }
      }
      for(const child of node.childs){
        nodeRecur(child);
      }
    }
  }
  const { importRefs: importSceneUuids }  = projectSetting.scene;
  for(const importSceneUuid of importSceneUuids){
    const sceneResourcePath = getResourcePath(importSceneUuid);
    const sceneAsset = readSceneAsset(sceneResourcePath);
    if(!sceneAsset) throw "error: readSceneAsset";
    dependencyMap.set(importSceneUuid, { type: "scene", resourcePath: sceneResourcePath });
    for(const root of sceneAsset.scene.roots){
      nodeRecur(root);
    }
  }

  // --build .pak
  const pakPath = path.join(BUILD_DIR, "pak0.pak");
  await fsExtra.ensureFile(pakPath);
  const fd = await fsExtra.open(pakPath, "w");

  const textEncoder = new TextEncoder();
  const little = true;

  const numEntry = dependencyMap.size;
  const headerSize = 12;
  const tableSize = 100 * numEntry;
  // header(12 bytes) id(4) table offset(4) table size(4), table entries: 56 36 4 4 bytes * numEntry
  const buffer = new ArrayBuffer(headerSize + tableSize);
  const headerUInt8View = new Uint8Array(buffer, 0, 4);
  const headerView = new DataView(buffer, 4, 8);
  headerUInt8View.set(textEncoder.encode("PAK0"), 0);
  headerView.setUint32(0, headerSize, little); // table offset
  headerView.setUint32(4, tableSize, little); // table size
  await fsExtra.write(fd, new Uint8Array(buffer));

  const tableUint8View = new Uint8Array(buffer, headerSize, tableSize);
  const tableView = new DataView(buffer, headerSize, tableSize);
  let tableOffset = 0;
  let resourceOffset = headerSize + tableSize;
  for(const [uuid, { type, resourcePath }] of dependencyMap){
    const resourceBuffer = await fsExtra.readFile(resourcePath);
    await fsExtra.write(fd, resourceBuffer);

    tableUint8View.set(textEncoder.encode(uuid), tableOffset);
    tableOffset += 56;
    tableUint8View.set(textEncoder.encode(type), tableOffset);
    tableOffset += 36;
    tableView.setUint32(tableOffset, resourceOffset, little);
    tableOffset += 4;
    tableView.setUint32(tableOffset, resourceBuffer.byteLength, little);
    tableOffset += 4;

    resourceOffset += resourceBuffer.byteLength;
  }
  await fsExtra.write(fd, new Uint8Array(buffer), 0, buffer.byteLength, 0);
  await fsExtra.close(fd);
}

