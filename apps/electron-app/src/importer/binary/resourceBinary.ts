import fs from "fs-extra";
import sharp from "sharp";

export async function saveMeshToBuffer(
    destPath: string,
    mesh: Resource.Mesh
){
    const { vertices, normals, uvs, vertexIndices } = mesh;
    const vertexCount = vertices.length / 3;
    if(normals.length !== vertexCount * 3) throw "Vertices and Normals mismatch";
    if(uvs.length !== vertexCount * 2) throw "UV count mismatch";

    const header = new Uint32Array([vertexCount, vertexIndices.length]);
    const interleaveBuffer = new Float32Array(vertexCount * (3 + 3 + 2));
    for(let i = 0; i < vertexCount; i++){
        const i3 = i * 3;
        const i2 = i * 2;
        const i8 = i * 8;
        interleaveBuffer[i8 + 0] = vertices[i3 + 0];
        interleaveBuffer[i8 + 1] = vertices[i3 + 1];
        interleaveBuffer[i8 + 2] = vertices[i3 + 2];
        interleaveBuffer[i8 + 3] = normals[i3 + 0];
        interleaveBuffer[i8 + 4] = normals[i3 + 1];
        interleaveBuffer[i8 + 5] = normals[i3 + 2];
        interleaveBuffer[i8 + 6] = uvs[i2 + 0];
        interleaveBuffer[i8 + 7] = uvs[i2 + 1];
    }
    const indexBuffer = new Uint32Array(vertexIndices);

    const buffer = Buffer.concat([
        Buffer.from(header.buffer),
        Buffer.from(interleaveBuffer.buffer),
        Buffer.from(indexBuffer.buffer)
    ]);
    await fs.writeFile(destPath, buffer);
}
export async function readMeshBinary(destPath: string): Promise<Resource.MeshBin>{
    const file = await fs.readFile(destPath);
    let offset = 0;

    const header = new Uint32Array(file.buffer, file.byteOffset, 2);
    offset += 2 * 4;
    const vertexCount = header[0];
    const vertexIndexCount = header[1];

    const interleaveBuffer = new Float32Array(file.buffer, file.byteOffset + offset, vertexCount * (3 + 3 + 2));
    offset += vertexCount * (3 + 3 + 2) * 4;

    const indexBuffer = new Uint32Array(file.buffer, file.byteOffset + offset, vertexIndexCount);

    // console.log(verticesCount, vertexIndexCount);
    // console.log(interleaveBuffer);
    // console.log(indexBuffer);
    return {
        interleave: interleaveBuffer,
        indices: indexBuffer
    };
}

export async function saveImageToBuffer(destPath: string, imagePath: string) {
    const { info, data } = await sharp(imagePath)
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    const header = new Uint32Array([info.width, info.height]);
    const buffer = Buffer.concat([
        Buffer.from(header.buffer),
        Buffer.from(data.buffer),
    ]);
    await fs.writeFile(destPath, buffer);
}
export async function readImageBinary(destPath: string): Promise<Resource.ImageBin>{
    const file = await fs.readFile(destPath);
    let offset = 0;

    const header = new Uint32Array(file.buffer, file.byteOffset, 2);
    offset += 2 * 4;
    const width = header[0];
    const height = header[1];

    const dataBuffer = new Uint8Array(file.buffer, file.byteOffset + offset, width * height * 4);
    return {
        width,
        height,
        data: dataBuffer
    }
}
