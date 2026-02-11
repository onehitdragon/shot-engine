import { vec3 } from "gl-matrix";
import type { Assets } from "../../../../engine-zod";

export async function createPrimitivesAssetMesh(assetDefaultPath: string){
    const [v0, v1, v2, v3, v4, v5, v6, v7] = [
        vec3.fromValues(1, 1, 1),   // v0
        vec3.fromValues(-1, 1, 1),  // v1
        vec3.fromValues(-1, -1, 1), // v2
        vec3.fromValues(1, -1, 1),  // v3
        vec3.fromValues(1, -1, -1), // v4
        vec3.fromValues(1, 1, -1),  // v5
        vec3.fromValues(-1, 1, -1), // v6
        vec3.fromValues(-1, -1, -1) // v7
    ];
    const [front, back, top, down, right, left] = [
        vec3.fromValues(0, 0, 1),   // front
        vec3.fromValues(0, 0, -1),  // back
        vec3.fromValues(0, 1, 0), // top
        vec3.fromValues(0, -1, 0),  // down
        vec3.fromValues(1, 0, 0),  // right
        vec3.fromValues(-1, 0, 0), // left
    ];
    const cubeMesh: MeshFormat.Mesh = {
        vertices: [
            ...v0, ...v1, ...v2, ...v3, // front
            ...v0, ...v3, ...v4, ...v5, // right
            ...v0, ...v5, ...v6, ...v1, // top
            ...v1, ...v6, ...v7, ...v2, // left
            ...v3, ...v2, ...v7, ...v4, // down
            ...v4, ...v7, ...v6, ...v5, // back
        ],
        normals: [
            ...front, ...front, ...front, ...front,
            ...right, ...right, ...right, ...right,
            ...top, ...top, ...top, ...top,
            ...left, ...left, ...left, ...left,
            ...down, ...down, ...down, ...down,
            ...back, ...back, ...back, ...back,
        ],
        vertexIndices: [
            0, 1, 2, 0, 2, 3,       // front
            4, 5, 6, 4, 6, 7,       // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15, // left
            16, 17, 18, 16, 18, 19, // down
            20, 21, 22, 20, 22, 23, // back
        ]
    }

    const meshName = `cube.mesh.json`;
    const meshPath = await window.fsPath.join(assetDefaultPath, meshName);
    await window.api.file.save(meshPath, JSON.stringify(cubeMesh, null, 2));
    const cubeMeshMeta: Assets.AssetMesh = {
        guid: "CUBE" as Components.PrimitiveMesh["primitiveType"],
        mesh: {}
    }
    const metaPath = meshPath + ".meta.json";
    await window.api.file.save(metaPath, JSON.stringify(cubeMeshMeta, null, 2));
}
