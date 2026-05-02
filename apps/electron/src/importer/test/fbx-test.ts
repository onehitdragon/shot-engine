import fs from "fs/promises";
import zlib from "zlib";
import path from "path";

async function readNodeRecord(inFile: fs.FileHandle, prevEndOffset: number){
    const results: FBXFormat.NodeRecord[] = [];
    while(true){
        let buffer = Buffer.alloc(4);
        await inFile.read(buffer, 0, 4, prevEndOffset);
        const endOffset = buffer.readUint32LE();
        if(!endOffset) break;
        const recordByteLen = endOffset - prevEndOffset;
        buffer = Buffer.alloc(recordByteLen);
        await inFile.read(buffer, 0, recordByteLen, prevEndOffset);
        const numProperties = buffer.readUint32LE(4);
        const propertyListLen = buffer.readUint32LE(8);
        const nameLen = buffer.readUint8(12);
        const nameEndOffset = 13 + nameLen;
        const name = buffer.toString("ascii", 13, nameEndOffset);
        let offset = nameEndOffset;
        const nodeRecord: FBXFormat.NodeRecord = {
            name,
            properties: [],
            nestedList: []
        }
        results.push(nodeRecord);
        for(let i = 0; i < numProperties; i++){
            const typeCode = String.fromCharCode(buffer.readUint8(offset)); offset += 1;
            if(typeCode === "S" || typeCode === "R"){
                const byteLen = buffer.readUint32LE(offset); offset += 4;
                const data = buffer.toString("utf8", offset, offset += byteLen).replace(/[\x00-\x1F\x7F]/g, "");
                const property: FBXFormat.SpecialProperty = {
                    typeCode,
                    data
                };
                nodeRecord.properties.push(property);
            }
            else if(
                typeCode === "Y" || typeCode === "C" || typeCode === "I" || 
                typeCode === "F" || typeCode === "D" || typeCode === "L"
            ){
                let data: number | bigint;
                if(typeCode === "Y"){
                    data = buffer.readInt16LE(offset); offset += 2;
                }
                else if(typeCode === "C"){
                    data = buffer.readUInt8(offset) & 1; offset += 1;
                }
                else if(typeCode === "I"){
                    data = buffer.readInt32LE(offset); offset += 4;
                }
                else if(typeCode === "F"){
                    data = buffer.readFloatLE(offset); offset += 4;
                }
                else if(typeCode === "D"){
                    data = buffer.readDoubleLE(offset); offset += 8;
                }
                else if(typeCode === "L"){
                    data = buffer.readBigInt64LE(offset); offset += 8;
                }
                else throw `typeCode: ${typeCode} is 'PrimitiveProperty' but haven't processed yet`;
                const property: FBXFormat.PrimitiveProperty = {
                    typeCode,
                    data
                };
                nodeRecord.properties.push(property);
            }
            else if(
                typeCode === "f" || typeCode === "d" || typeCode === "l" || 
                typeCode === "i" || typeCode === "b"
            ){
                const arrayLength = buffer.readUint32LE(offset); offset += 4;
                const encoding = buffer.readUint32LE(offset); offset += 4; // 0 - no compress, 1 - deflate/zip-compressed
                const compressedLength = buffer.readUint32LE(offset); offset += 4;
                const data: number[] = [];
                if(!encoding){
                    for(let i = 0; i < arrayLength; i++){
                        if(typeCode === "f"){
                            data.push(buffer.readFloatLE(offset)); offset += 4;
                        }
                        else if(typeCode === "d"){
                            data.push(buffer.readDoubleLE(offset)); offset += 8;
                        }
                        else if(typeCode === "i"){
                            data.push(buffer.readInt32LE(offset)); offset += 4;
                        }
                        else if(typeCode === "b"){
                            data.push(buffer.readUInt8(offset)); offset += 1;
                        }
                        else throw `typeCode: ${typeCode} is 'ArrayProperty' but haven't processed yet`;
                    }
                }
                else{
                    const compressedBuffer = buffer.subarray(offset, offset += compressedLength);
                    const decompressedBuffer = zlib.inflateSync(compressedBuffer);
                    for(let i = 0, j = 0; i < arrayLength; i++){
                        if(typeCode === "f"){
                            data.push(decompressedBuffer.readFloatLE(j)); j += 4;
                        }
                        else if(typeCode === "d"){
                            data.push(decompressedBuffer.readDoubleLE(j)); j += 8;
                        }
                        else if(typeCode === "i"){
                            data.push(decompressedBuffer.readInt32LE(j)); j += 4;
                        }
                        else if(typeCode === "b"){
                            data.push(decompressedBuffer.readUInt8(j)); j += 1;
                        }
                        else throw `typeCode: ${typeCode} is 'ArrayProperty' but haven't processed yet`;
                    }
                }
                const property: FBXFormat.ArrayProperty = {
                    typeCode,
                    data
                };
                nodeRecord.properties.push(property);
            }
            else {
                throw `typeCode: ${typeCode} haven't process yet`
            }
        }
        if(offset < recordByteLen){
            nodeRecord.nestedList = await readNodeRecord(inFile, prevEndOffset + offset);
        }
        prevEndOffset = endOffset;
    }
    return results;
}
function findNodeRecordByName(nodeRecords: FBXFormat.NodeRecord[], name: string){
    let result: FBXFormat.NodeRecord | null = null;
    for(const nodeRecord of nodeRecords){
        if(nodeRecord.name === name){
            result = nodeRecord;
            break;
        }
    }
    return result;
}
function blenderToEngineCoordinate(components: number[]){
    for(let i = 0; i < components.length; i += 3){
        const [x, y, z] = [components[i], components[i + 1], components[i + 2]];
        [components[i], components[i + 1], components[i + 2]] = [x, z, -y];
    }
}
function createNormalFromByPolygonVertex(normals: number[], normalIndices: number[]){
    const result: number[] = [];
    for(let i = 0; i < normalIndices.length; i += 3){
        const index0 = normalIndices[i] * 3;
        const index1 = normalIndices[i + 1] * 3;
        const index2 = normalIndices[i + 2] * 3;
        result.push(normals[index0], normals[index0 + 1], normals[index0 + 2]);
        result.push(normals[index1], normals[index1 + 1], normals[index1 + 2]);
        result.push(normals[index2], normals[index2 + 1], normals[index2 + 2]);
    }
    return result;
}
function createNormalFromByVertice(normals: number[], vertexIndices: number[]){
    const result: number[] = [];
    for(let i = 0; i < vertexIndices.length; i += 3){
        const index0 = vertexIndices[i] * 3;
        const index1 = vertexIndices[i + 1] * 3;
        const index2 = vertexIndices[i + 2] * 3;
        result.push(normals[index0], normals[index0 + 1], normals[index0 + 2]);
        result.push(normals[index1], normals[index1 + 1], normals[index1 + 2]);
        result.push(normals[index2], normals[index2 + 1], normals[index2 + 2]);
    }
    return result;
}
function createFBX(topNodeRecords: FBXFormat.NodeRecord[]){
    const objectsNodeRecord = findNodeRecordByName(topNodeRecords, "Objects");
    if(!objectsNodeRecord) throw "dont find node record with name 'Objects'";
    const objectNodes: FBXFormat.ObjectNode[] = [];
    for(const objectNodeRecord of objectsNodeRecord.nestedList){
        const { name, properties, nestedList } = objectNodeRecord;
        if(name === "Model"){
            const modelNode: FBXFormat.ModelNode = {
                id: (properties[0] as FBXFormat.PrimitiveProperty).data as bigint,
                name: (properties[1] as FBXFormat.SpecialProperty).data,
                type: "Model",
                childs: []
            }
            objectNodes.push(modelNode);
        }
        else if(name === "Geometry"){
            const geometryNode: FBXFormat.GeometryNode = {
                id: (properties[0] as FBXFormat.PrimitiveProperty).data as bigint,
                name: (properties[1] as FBXFormat.SpecialProperty).data,
                type: "Geometry",
                childs: [],
                vertices: [],
                vertexIndices: [],
                normals: [],
                layerElementUV: {
                    mappingInformationType: "ByPolygonVertex",
                    UVs: [],
                    UVIndices: []
                },
            }
            objectNodes.push(geometryNode);
            const verticesNodeRecord = findNodeRecordByName(nestedList, "Vertices");
            if(!verticesNodeRecord) throw "dont find node record with name 'Vertices'";
            geometryNode.vertices = (verticesNodeRecord.properties[0] as FBXFormat.ArrayProperty).data;
            blenderToEngineCoordinate(geometryNode.vertices);
            const polygonVertexIndexNodeRecord = findNodeRecordByName(nestedList, "PolygonVertexIndex");
            if(!polygonVertexIndexNodeRecord) throw "dont find node record with name 'PolygonVertexIndex'";
            geometryNode.vertexIndices = 
            (polygonVertexIndexNodeRecord.properties[0] as FBXFormat.ArrayProperty).data.map(value => {
                if(value >= 0) return value;
                else return -(value + 1);
            });
            
            const layerElementNormalNodeRecord = findNodeRecordByName(nestedList, "LayerElementNormal");
            if(!layerElementNormalNodeRecord) throw "dont find node record with name 'LayerElementNormal'";
            const mappingInformationTypeNodeRecord = findNodeRecordByName(layerElementNormalNodeRecord.nestedList, "MappingInformationType");
            if(!mappingInformationTypeNodeRecord) throw "dont find node record with name 'MappingInformationType'";
            const mappingInformationType =
            (mappingInformationTypeNodeRecord.properties[0] as FBXFormat.SpecialProperty).data;
            const normalsNodeRecord = findNodeRecordByName(layerElementNormalNodeRecord.nestedList, "Normals");
            if(!normalsNodeRecord) throw "dont find node record with name 'Normals'";
            const normalsIndexNodeRecord = findNodeRecordByName(layerElementNormalNodeRecord.nestedList, "NormalsIndex");
            if(!normalsIndexNodeRecord) throw "dont find node record with name 'NormalsIndex'";
            const normals = (normalsNodeRecord.properties[0] as FBXFormat.ArrayProperty).data;
            blenderToEngineCoordinate(normals);
            const normalIndices = 
            (normalsIndexNodeRecord.properties[0] as FBXFormat.ArrayProperty).data;
            if(mappingInformationType === "ByPolygonVertex"){
                geometryNode.normals = createNormalFromByPolygonVertex(normals, normalIndices);
            }
            else if(mappingInformationType === "ByVertice"){
                if(Math.max(...geometryNode.vertexIndices) != Math.max(...normalIndices)){
                    throw `fbx parser internal error`;
                }
                geometryNode.normals = createNormalFromByVertice(normals, geometryNode.vertexIndices);
            }
            else throw `dont support mappingInformationType: ${mappingInformationType}`;
            
            console.log(
                geometryNode.name, geometryNode.vertices.length, geometryNode.vertexIndices.length,
                mappingInformationType
            );
        }
    }
    const connectionsNodeRecord = findNodeRecordByName(topNodeRecords, "Connections");
    if(!connectionsNodeRecord) throw "dont find top level node record with name 'Objects'";
    const parentObjectNodes: FBXFormat.ObjectNode[] = [];
    for(const connectionNodeRecord of connectionsNodeRecord.nestedList){
        const { name, properties, nestedList } = connectionNodeRecord;
        if(name === "C" && (properties[0] as FBXFormat.SpecialProperty).data === "OO"){
            const childId = (properties[1] as FBXFormat.PrimitiveProperty).data as bigint;
            const childObjectNode = objectNodes.find((value) => value.id === childId);
            if(!childObjectNode) throw `connection error: dont find child object node with id ${childId}`;
            const parentId = (properties[2] as FBXFormat.PrimitiveProperty).data as bigint;
            if(parentId === 0n){
                parentObjectNodes.push(childObjectNode);
                continue;
            }
            const parentIdObjectNode = objectNodes.find((value) => value.id === parentId);
            if(!parentIdObjectNode) throw `connection error: dont find parent object node with id ${parentId}`;
            parentIdObjectNode.childs.push(childObjectNode);
        }
    }
    const fbx: FBXFormat.FBX = {
        parentObjectNodes
    }
    return fbx;
}

async function fbx(inPath: string){
    const inFile = await fs.open(inPath, "r");
    const outFile1 = await fs.open(`src/importer/test/fbx-debug/${path.basename(inPath)}.out1`, "w");
    const outFile2 = await fs.open(`src/importer/test/fbx-debug/${path.basename(inPath)}.out2`, "w");

    let buffer = Buffer.alloc(27);
    let prevEndOffset = 0;

    await inFile.read(buffer, 0, 27, prevEndOffset);
    await outFile1.write(`Fbx version: ${buffer.readUint32LE(23)} \n`);
    prevEndOffset += 27;

    const topNodeRecords = await readNodeRecord(inFile, prevEndOffset);
    // debug 
    await outFile1.write(`${JSON.stringify(topNodeRecords, (key, value) => {
        return typeof value === "bigint" ? value.toString() : value;
    }, 2)} \n`);

    const fbx = createFBX(topNodeRecords);
    // debug
    await outFile2.write(`${JSON.stringify(fbx, (key, value) => {
        return typeof value === "bigint" ? value.toString() : value;
    }, 2)} \n`);

    await inFile.close();
    await outFile1.close();
    await outFile2.close();
    return fbx;
}

export { fbx as importFbx }
