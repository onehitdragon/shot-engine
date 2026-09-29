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
    const interleaveArray = new Float32Array([
        ...v0, ...front, 1, 1, ...v1, ...front, 0, 1, ...v2, ...front, 0, 0, ...v3, ...front, 1, 0,// front
        ...v0, ...right, 1, 1, ...v3, ...right, 0, 1, ...v4, ...right, 0, 0, ...v5, ...right, 1, 0,// right
        ...v0, ...top, 1, 1, ...v5, ...top, 0, 1, ...v6, ...top, 0, 0, ...v1, ...top, 1, 0,// top
        ...v1, ...left, 1, 1, ...v6, ...left, 0, 1, ...v7, ...left, 0, 0, ...v2, ...left, 1, 0,// left
        ...v3, ...down, 1, 1, ...v2, ...down, 0, 1, ...v7, ...down, 0, 0, ...v4, ...down, 1, 0,// down
        ...v4, ...back, 1, 1, ...v7, ...back, 0, 1, ...v6, ...back, 0, 0, ...v5, ...back, 1, 0,// back
    ]);
    const indices = new Uint8Array(
        [
            0, 1, 2, 0, 2, 3,       // front
            4, 5, 6, 4, 6, 7,       // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15, // left
            16, 17, 18, 16, 18, 19, // down
            20, 21, 22, 20, 22, 23, // back
        ]
    );
    const interleaveArrayWithTangent = ShotEngineType.MeshHelper.InterleaveArrayTangent(
        interleaveArray,
        indices
    );
    const cubeAssetMesh: ShotEngineType.MeshAsset = {
        primitives: [{
            type: "static",
            attribute: {
                interleaveArray: new Uint8Array(interleaveArrayWithTangent.buffer)
            },
            indices,
            indexType: 5121,
            drawMode: 4,
            aabb: ShotEngineType.AABB.FromVertices(
                [...v0, ...v1, ...v2, ...v3, ...v4, ...v5, ...v6, ...v7]
            ),
            invBindPoseMatrices: new Float32Array()
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
    const positions: number[] = []; // for aabb

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
            positions.push(px, py, pz);
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

    const interleaveArray = new Float32Array(vertices);
    const indicesOut = new Uint16Array(indices);
    const interleaveArrayWithTangent = ShotEngineType.MeshHelper.InterleaveArrayTangent(
        interleaveArray,
        indices
    );
    const sphereAssetMesh: ShotEngineType.MeshAsset = {
        primitives: [{
            type: "static",
            attribute: {
                interleaveArray: new Uint8Array(interleaveArrayWithTangent.buffer),
            },

            // ~2400 indices => Uint16
            indices: indicesOut,

            // gl.UNSIGNED_SHORT
            indexType: 5123,

            // gl.TRIANGLES
            drawMode: 4,

            aabb: ShotEngineType.AABB.FromVertices(positions),

            invBindPoseMatrices: new Float32Array()
        }]
    };

    return sphereAssetMesh;
}
export function createDefaultCylinderAssetMesh(){
    const nSegment = 64;
    const height = 2;
    const r = 1;
    
    const theta = 2 * Math.PI / nSegment;
    const vertices: number[] = []; // [top, bottom]
    const topVertices: number[] = []; // [top]
    const botVertices: number[] = []; // [bottom]
    for(let i = 0; i < nSegment; i++){
        const x = Math.cos(theta * i) * r;
        const z = Math.sin(theta * i) * r;
        const y = height / 2;
        vertices.push(x, y, z);
        vertices.push(x, -y, z);
        topVertices.push(x, y, z);
        botVertices.push(x, -y, z);
    }
    vertices.push(vertices[0], vertices[1], vertices[2]); // add more t vertex
    vertices.push(vertices[3], vertices[4], vertices[5]); // add more b vertex

    // side
    const nVertex = Math.floor(vertices.length / 3);
    const indicies: number[] = [];
    for(let i = 0; i < nVertex - 2; i += 2){
        const t0 = i;
        const b0 = i + 1;
        let t1 = i + 2;
        let b1 = i + 3;

        indicies.push(t0, t1, b1);
        indicies.push(t0, b1, b0);
    }
    const interleave: number[] = [];
    const du = 1 / nSegment;
    for(let i = 0, u = 1, v = 1; i < vertices.length; i += 3){
        const vertex = [vertices[i], vertices[i + 1], vertices[i + 2]];
        let normal = [vertices[i], 0, vertices[i + 2]];
        normal = ShotEngineType.Vec3.ToArray(
            ShotEngineType.Vec3.Normalize(ShotEngineType.Vec3.FromArray(normal))
        );
        const uv = [u, v];
        interleave.push(...vertex, ...normal, ...uv);
        if(v === 0) u -= du;
        if(v === 0) v = 1; else v = 0;
    }

    // top
    const previous = nVertex;
    const nTopVertex = Math.floor(topVertices.length / 3) + previous;
    const topCenterIndex = nTopVertex;
    topVertices.push(0, height/2, 0);
    const topIndicies: number[] = [];
    for(let i = previous; i < nTopVertex; i++){
        const t0 = i;
        let t1 = i + 1;
        if(t1 >= nTopVertex){
            t1 = previous;
        }
        topIndicies.push(topCenterIndex, t1, t0);
    }
    indicies.push(...topIndicies);
    for(let i = 0; i < topVertices.length; i += 3){
        const vertex = [topVertices[i], topVertices[i + 1], topVertices[i + 2]];
        let normal = [0, 1, 0];
        normal = ShotEngineType.Vec3.ToArray(
            ShotEngineType.Vec3.Normalize(ShotEngineType.Vec3.FromArray(normal))
        );
        let uv = [vertex[0]/(2*r)+0.5, vertex[2]/(2*r)+0.5];
        if(i === topVertices.length - 3){ // center vertex
            uv = [0.5, 0.5];
        }
        interleave.push(...vertex, ...normal, ...uv);
    }

    // bot
    const previous2 = nTopVertex + 1;
    const nBottomVertex = Math.floor(botVertices.length / 3) + previous2;
    const botCenterIndex = nBottomVertex;
    botVertices.push(0, -height/2, 0);
    const botIndicies: number[] = [];
    for(let i = previous2; i < nBottomVertex; i++){
        const b0 = i;
        let b1 = i + 1;
        if(b1 >= nBottomVertex){
            b1 = previous2;
        }
        botIndicies.push(botCenterIndex, b0, b1);
    }
    indicies.push(...botIndicies);
    for(let i = 0; i < botVertices.length; i += 3){
        const vertex = [botVertices[i], botVertices[i + 1], botVertices[i + 2]];
        let normal = [0, -1, 0];
        normal = ShotEngineType.Vec3.ToArray(
            ShotEngineType.Vec3.Normalize(ShotEngineType.Vec3.FromArray(normal))
        );
        let uv = [vertex[0]/(2*r)+0.5, vertex[2]/(2*r)+0.5];
        if(i === botVertices.length - 3){ // center vertex
            uv = [0.5, 0.5];
        }
        interleave.push(...vertex, ...normal, ...uv);
    }

    const interleaveArray = new Float32Array(interleave);
    const indicesOut = new Uint16Array(indicies);
    const interleaveArrayWithTangent = ShotEngineType.MeshHelper.InterleaveArrayTangent(
        interleaveArray,
        indicesOut
    );
    const assetMesh: ShotEngineType.MeshAsset = {
        primitives: [{
            type: "static",
            attribute: {
                interleaveArray: new Uint8Array(interleaveArrayWithTangent.buffer),
            },

            // indices => Uint16
            indices: indicesOut,

            // gl.UNSIGNED_SHORT
            indexType: 5123,

            // gl.TRIANGLES
            drawMode: 4,

            aabb: ShotEngineType.AABB.FromVertices([...vertices, ...topVertices, ...botVertices]),

            invBindPoseMatrices: new Float32Array()
        }]
    };
    return assetMesh;
}
export function createDefaultConeAssetMesh(){
    const nSegment = 64;
    const height = 2;
    const r = 1;
    
    const theta = 2 * Math.PI / nSegment;
    const vertices: number[] = []; // [bottom, topCenter]
    const botVertices: number[] = [];
    for(let i = 0; i < nSegment; i++){
        const x = Math.cos(theta * i) * r;
        const z = Math.sin(theta * i) * r;
        const y = height / 2;
        vertices.push(x, -y, z);
        vertices.push(0, y, 0);
        botVertices.push(x, -y, z);
    }
    vertices.push(vertices[0], vertices[1], vertices[2]); // add more first vertex

    // side
    const nVertex = Math.floor(vertices.length / 3);
    const indicies: number[] = [];
    for(let i = 0; i < nVertex - 1; i += 2){
        const b0 = i;
        const c = i + 1;
        let b1 = i + 2;
        indicies.push(b0, c, b1);
    }
    const interleave: number[] = [];
    const k = Math.pow(r/height, 2);
    const du = 1 / nSegment;
    for(let i = 0, u = 1; i < vertices.length; i += 3){
        const vertexIndex = Math.floor(i / 3);
        const vertex = [vertices[i], vertices[i + 1], vertices[i + 2]];
        let normal = [vertex[0],  k * (height/2 - vertex[1]), vertex[2]];
        if(vertexIndex % 2 !== 0){ // center
            let j = i - 3;
            let jj = i + 3;
            normal = [
                vertices[j] + vertices[jj],
                k * (height/2 - vertices[j + 1]) + k * (height/2 - vertices[jj + 1]),
                vertices[j + 2] + vertices[jj + 2]
            ];
        }
        normal = ShotEngineType.Vec3.ToArray(
            ShotEngineType.Vec3.Normalize(ShotEngineType.Vec3.FromArray(normal))
        );
        let uv: number[];
        if(vertexIndex % 2 !== 0){ // center
            uv = [u - (du / 2), 1];
            u -= du;
        }
        else{
            uv = [u, 0];
        }
        interleave.push(...vertex, ...normal, ...uv);
    }

    // bot
    const previous = nVertex;
    const nBottomVertex = Math.floor(botVertices.length / 3) + previous;
    const botCenterIndex = nBottomVertex;
    botVertices.push(0, -height/2, 0);
    const botIndicies: number[] = [];
    for(let i = previous; i < nBottomVertex; i++){
        const b0 = i;
        let b1 = i + 1;
        if(b1 >= nBottomVertex){
            b1 = previous;
        }
        botIndicies.push(botCenterIndex, b0, b1);
    }
    indicies.push(...botIndicies);
    for(let i = 0; i < botVertices.length; i += 3){
        const vertex = [botVertices[i], botVertices[i + 1], botVertices[i + 2]];
        let normal = [0, -1, 0];
        normal = ShotEngineType.Vec3.ToArray(
            ShotEngineType.Vec3.Normalize(ShotEngineType.Vec3.FromArray(normal))
        );
        let uv = [vertex[0]/(2*r)+0.5, vertex[2]/(2*r)+0.5];
        if(i === botVertices.length - 3){ // center vertex
            uv = [0.5, 0.5];
        }
        interleave.push(...vertex, ...normal, ...uv);
    }

    const interleaveArray = new Float32Array(interleave);
    const indicesOut = new Uint16Array(indicies);
    const interleaveArrayWithTangent = ShotEngineType.MeshHelper.InterleaveArrayTangent(
        interleaveArray,
        indicesOut
    );
    const assetMesh: ShotEngineType.MeshAsset = {
        primitives: [{
            type: "static",
            attribute: {
                interleaveArray: new Uint8Array(interleaveArrayWithTangent.buffer),
            },

            // indices => Uint16
            indices: indicesOut,

            // gl.UNSIGNED_SHORT
            indexType: 5123,

            // gl.TRIANGLES
            drawMode: 4,

            aabb: ShotEngineType.AABB.FromVertices([...vertices, ...botVertices]),

            invBindPoseMatrices: new Float32Array()
        }]
    };
    return assetMesh;
}
