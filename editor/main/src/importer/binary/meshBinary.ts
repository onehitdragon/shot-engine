import fs from "fs-extra";

export async function saveMeshToBuffer(
    destPath: string,
    mesh: Resource.Mesh
){
    const { vertices, normals, vertexIndices } = mesh;
    if(vertices.length !== normals.length) throw "meshToBuffer error";
    const vertexCount = vertices.length / 3;

    const header = new Uint32Array([vertices.length, vertexIndices.length]);
    const interleaveBuffer = new Float32Array(vertexCount * (3 + 3));
    for(let i = 0; i < vertexCount; i++){
        const i3 = i * 3;
        const i6 = i * 6;
        interleaveBuffer[i6 + 0] = vertices[i3 + 0];
        interleaveBuffer[i6 + 1] = vertices[i3 + 1];
        interleaveBuffer[i6 + 2] = vertices[i3 + 2];
        interleaveBuffer[i6 + 3] = normals[i3 + 0];
        interleaveBuffer[i6 + 4] = normals[i3 + 1];
        interleaveBuffer[i6 + 5] = normals[i3 + 2];
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
    const verticesCount = header[0];
    const vertexIndexCount = header[1];

    const interleaveBuffer = new Float32Array(file.buffer, file.byteOffset + offset, verticesCount * 2);
    offset += verticesCount * 2 * 4;

    const indexBuffer = new Uint32Array(file.buffer, file.byteOffset + offset, vertexIndexCount);

    // console.log(verticesCount, vertexIndexCount);
    // console.log(interleaveBuffer);
    // console.log(indexBuffer);
    return {
        interleave: interleaveBuffer,
        indices: indexBuffer
    };
}
