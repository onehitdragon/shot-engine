import * as ShotEngineType from "@shot-engine/types";

export function createDefaultCubeAssetMesh(){
    const [v0, v1, v2, v3, v4, v5, v6, v7] = [
        [1, 1, 1],   // v0
        [-1, 1, 1],  // v1
        [-1, -1, 1], // v2
        [1, -1, 1],  // v3
        [1, -1, -1], // v4
        [1, 1, -1],  // v5
        [-1, 1, -1], // v6
        [-1, -1, -1] // v7
    ];
    const [front, back, top, down, right, left] = [
        [0, 0, 1],   // front
        [0, 0, -1],  // back
        [0, 1, 0], // top
        [0, -1, 0],  // down
        [1, 0, 0],  // right
        [-1, 0, 0], // left
    ];
    const cubeAssetMesh: ShotEngineType.MeshAsset = {
        primitives: [{
            attribute: {
                interleaveArray: new Float32Array([
                    ...v0, ...front, 1, 1, ...v1, ...front, 0, 1, ...v2, ...front, 0, 0, ...v3, ...front, 1, 0,// front
                    ...v0, ...right, 1, 1, ...v3, ...right, 0, 1, ...v4, ...right, 0, 0, ...v5, ...right, 1, 0,// right
                    ...v0, ...top, 1, 1, ...v5, ...top, 0, 1, ...v6, ...top, 0, 0, ...v1, ...top, 1, 0,// top
                    ...v1, ...left, 1, 1, ...v6, ...left, 0, 1, ...v7, ...left, 0, 0, ...v2, ...left, 1, 0,// left
                    ...v3, ...down, 1, 1, ...v2, ...down, 0, 1, ...v7, ...down, 0, 0, ...v4, ...down, 1, 0,// down
                    ...v4, ...back, 1, 1, ...v7, ...back, 0, 1, ...v6, ...back, 0, 0, ...v5, ...back, 1, 0,// back
                ]),
            },
            indices: new Uint8Array(
                [
                    0, 1, 2, 0, 2, 3,       // front
                    4, 5, 6, 4, 6, 7,       // right
                    8, 9, 10, 8, 10, 11,    // up
                    12, 13, 14, 12, 14, 15, // left
                    16, 17, 18, 16, 18, 19, // down
                    20, 21, 22, 20, 22, 23, // back
                ]
            ),
            indexType: 5121,
            drawMode: 4
        }]
    }

    return cubeAssetMesh;
}
export function createDefaultSphereAssetMesh(){
    const radius = 1;

    const widthSegments = 24;
    const heightSegments = 16;

    const vertices: number[] = [];
    const indices: number[] = [];

    // position(3) + normal(3) + uv(2)
    // stride = 8

    for (let y = 0; y <= heightSegments; y++) {

        const v = y / heightSegments;
        const theta = v * Math.PI;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let x = 0; x <= widthSegments; x++) {

            const u = x / widthSegments;
            const phi = u * Math.PI * 2;

            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const nx = cosPhi * sinTheta;
            const ny = cosTheta;
            const nz = sinPhi * sinTheta;

            const px = radius * nx;
            const py = radius * ny;
            const pz = radius * nz;

            vertices.push(
                px, py, pz, // position
                nx, ny, nz, // normal
                u, 1 - v    // uv
            );
        }
    }

    for (let y = 0; y < heightSegments; y++) {

        for (let x = 0; x < widthSegments; x++) {

            const a = y * (widthSegments + 1) + x;
            const b = a + widthSegments + 1;

            indices.push(
                a, b, a + 1,
                b, b + 1, a + 1
            );
        }
    }

    const sphereAssetMesh: ShotEngineType.MeshAsset = {
        primitives: [{
            attribute: {
                interleaveArray: new Float32Array(vertices),
            },

            // ~2400 indices => Uint16
            indices: new Uint16Array(indices),

            // gl.UNSIGNED_SHORT
            indexType: 5123,

            // gl.TRIANGLES
            drawMode: 4
        }]
    };

    return sphereAssetMesh;
}
