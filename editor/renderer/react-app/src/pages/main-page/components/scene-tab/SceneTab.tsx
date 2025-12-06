import { useEffect, useRef } from "react";
import vShaderSource from "./shaders/vshader?raw";
import fShaderSource from "./shaders/fshader?raw";
import crateImage from "./textures/crate-texture.jpg";
import { mat4, quat, vec3, vec4 } from "gl-matrix";

const modelTest = {
    colors: new Float32Array([
        // 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // front-red
        // 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // right-green
        // 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // top-blue
        // 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, // left-yellow
        // 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, // down-cyan
        // 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, // back-magenta

        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]),
    normals: new Float32Array([
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,     // front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // right
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,     // up
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // left
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // down
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // back
    ]),
    vertices: new Float32Array([
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        -1,
        -1,
        -1,
        1,
        -1,
        1,
        -1,
        1,
        1,
        1,
        1,
        1,
        -1,
        -1,
        1,
        1,
        -1
    ]),
    triangles: new Uint32Array([
        1,
        2,
        0,
        3,
        6,
        2,
        7,
        4,
        6,
        5,
        0,
        4,
        6,
        0,
        2,
        3,
        5,
        7,
        1,
        3,
        2,
        3,
        7,
        6,
        7,
        5,
        4,
        5,
        1,
        0,
        6,
        4,
        0,
        3,
        1,
        5
    ])
}

const cube = {
    pos: vec3.fromValues(0, 0, 0),
    rot: vec3.fromValues(0, -30, 0),
    scale: vec3.fromValues(1, 1, 1)
}
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
const cubeModel = {
    vertices: new Float32Array([
        ...v0, ...v1, ...v2, ...v3, // front
        ...v0, ...v3, ...v4, ...v5, // right
        ...v0, ...v5, ...v6, ...v1, // top
        ...v1, ...v6, ...v7, ...v2, // left
        ...v3, ...v2, ...v7, ...v4, // down
        ...v4, ...v7, ...v6, ...v5, // back
    ]),
    colors: new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // front-red
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // right-green
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // top-blue
        1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, // left-yellow
        0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, // down-cyan
        1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, // back-magenta

        // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]),
    triangles: new Uint32Array([
        0, 1, 2, 0, 2, 3,       // front
        4, 5, 6, 4, 6, 7,       // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23, // back
    ]),
    normals: new Float32Array([
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,     // front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // right
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,     // up
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // left
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // down
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // back
    ]),
}
const camera = {
    pos: vec3.fromValues(0, 0, 5),
    rot: vec3.fromValues(0, 0, 0)
}
const light = {
    direction: vec4.fromValues(0, 1, 1, 1),
    color: vec4.fromValues(1, 1, 1, 1),
}
const modelMat4 = mat4.create();
let q = quat.create();
quat.fromEuler(q, cube.rot[0], cube.rot[1], cube.rot[2], "yxz");
mat4.fromRotationTranslationScale(modelMat4, q, cube.pos, cube.scale);
const localModelMat4 = mat4.create();
quat.conjugate(q, q);
mat4.fromQuat(localModelMat4, q);
const viewMat4 = mat4.create();
quat.fromEuler(q, camera.rot[0], camera.rot[1], camera.rot[2], "yxz");
quat.conjugate(q, q);
mat4.fromQuat(viewMat4, q);
mat4.translate(viewMat4, viewMat4, vec3.negate([], camera.pos));
const clipMat4 = mat4.create();
mat4.perspective(clipMat4, 45 * Math.PI / 180, 1, 1, 100);
const mvpMat4 = mat4.create();
mat4.multiply(mvpMat4, clipMat4, viewMat4); // P * V
mat4.multiply(mvpMat4, mvpMat4, modelMat4); // P * V * M

export function SceneTab(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        let canceled = false;
        const setup = async () => {
            // const image = await loadImage(crateImage);
            // if(canceled) return;
            const canvas = canvasRef.current;
            if(!canvas) return;
            const gl = canvas.getContext("webgl2");
            if(!gl) return;
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);
            const glProgram = initShaders(gl);
            const n = initVertexBuffer(gl, glProgram);

            const u_MvpMatrix = gl.getUniformLocation(glProgram, "u_MvpMatrix");
            if(!u_MvpMatrix) throw "u_MvpMatrix dont exist";
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMat4);
            const u_LocalModelMatrix = gl.getUniformLocation(glProgram, "u_LocalModelMatrix");
            if(!u_LocalModelMatrix) throw "u_LocalModelMatrix dont exist";
            gl.uniformMatrix4fv(u_LocalModelMatrix, false, localModelMat4);
            const u_LightDirection = gl.getUniformLocation(glProgram, "u_LightDirection");
            if(!u_LightDirection) throw "u_LightDirection dont exist";
            gl.uniform4fv(u_LightDirection, light.direction);
            const u_LightColor = gl.getUniformLocation(glProgram, "u_LightColor");
            if(!u_LightColor) throw "u_LightColor dont exist";
            gl.uniform4fv(u_LightColor, light.color);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_INT, 0);
        }
        setup();
        return () => {
            canceled = true;
        };
    }, []);

    return <div>
        <canvas ref={canvasRef} id="example" width={300} height={300}>
            Dont supports "canvas"
        </canvas>
    </div>;
}
function initShaders(gl: WebGLRenderingContext){
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    if(vShader == null) throw "Cant create vertex shader";
    gl.shaderSource(vShader, vShaderSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    if(fShader == null) throw "Cant create fragment shader";
    gl.shaderSource(fShader, fShaderSource);
    gl.compileShader(fShader);
    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(fShader);

    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    return program;
}
function initVertexBuffer(gl: WebGLRenderingContext, glProgram: WebGLProgram){
    const vertices = modelTest.vertices;
    const colors = modelTest.colors;
    const triangles = modelTest.triangles;
    const normals = modelTest.normals;
    const n = triangles.length;

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(glProgram, "a_Position");
    if(a_Position < 0) throw "a_Position dont exist";
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const a_Color = gl.getAttribLocation(glProgram, "a_Color");
    if(a_Color < 0) throw "a_Color dont exist";
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    const a_Normal = gl.getAttribLocation(glProgram, "a_Normal");
    if(a_Normal < 0) throw "a_Normal dont exist";
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

    return n;
}
function loadImage(src: string){
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject("Cant load image at " + src);
        image.src = crateImage;
    });
    return promise;
}
function initTextures(gl: WebGLRenderingContext, glProgram: WebGLProgram, image: HTMLImageElement){
    const texture = gl.createTexture();
    const u_Sampler = gl.getUniformLocation(glProgram, 'u_Sampler');
    if(u_Sampler === null) throw "dont find u_Sampler";
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);   
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, 0);
}
