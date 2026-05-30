import { createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch, RootState } from "../store"
import { showInspector } from "../slices/inspector-slice"
import type { AssetManager, HdrAsset, ImageAsset, MeshAsset, PrefabAsset, SceneAsset } from "@shot-engine/types";
import { mat4, quat } from "gl-matrix";
import { WebglHelper } from "../../pages/main-page/helpers/resource-manager-helper/WebglHelper";
import { getCubeMeshData } from "../../pages/main-page/helpers/scene-manager-helper/mesh-datas";
import cubemapVS from "../../pages/main-page/helpers/shaders/hdr-shader/cubemap-vs.glsl?raw";
import equirectangularFS from "../../pages/main-page/helpers/shaders/hdr-shader/equirectangular-fs.glsl?raw";

export const inspectAssetThunk = createAsyncThunk
<
    void,
    {
        assetInfo: AssetManager.AssetInfo
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspector/inspectAsset",
    async ({ assetInfo }, { dispatch, rejectWithValue }) => {
        try{
            if(assetInfo.type === "other"){
                dispatch(showInspector({ inspector: {
                    type: "text",
                    content: "this asset not support"
                } }));
                return;
            }
            if(assetInfo.type === "image"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "image");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "image",
                    assetInfo,
                    imageAsset: asset as ImageAsset
                } }));
                return;
            }
            if(assetInfo.type === "mesh"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "mesh");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "mesh",
                    assetInfo,
                    meshAsset: asset as MeshAsset
                } }));
                return;
            }
            if(assetInfo.type === "prefab"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "prefab");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "prefab",
                    assetInfo,
                    prefabAsset: asset as PrefabAsset
                } }));
                return;
            }
            if(assetInfo.type === "scene"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "scene");
                if(!asset) throw "asset is bad";
                dispatch(showInspector({ inspector: {
                    type: "scene",
                    assetInfo,
                    sceneAsset: asset as SceneAsset
                } }));
                return;
            }
            if(assetInfo.type === "hdr"){
                const asset = await window.api.assetManager.getAssetFromUuid(assetInfo.uuid, "hdr");
                dispatch(showInspector({ inspector: {
                    type: "hdr",
                    assetInfo,
                    hdrAsset: asset as HdrAsset
                } }));
                return;
            }
        }
        catch(err){
            await window.api.showError(String(err));
            rejectWithValue(err);
        }
    }
);
export const bakeHdrFileThunk = createAsyncThunk
<
    void,
    {
        assetInfo: AssetManager.AssetInfo,
        gl: WebGL2RenderingContext,
        complete?: () => void
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspector/bakeHdrFileThunk",
    async ({ assetInfo, gl, complete }, { rejectWithValue }) => {
        try{
            const filePath = await window.api.assetManager.getFilePathFromAssetId(assetInfo.uuid);
            if(!filePath) throw "cant find hdr file";
            const hdr = await window.api.hdr.read(filePath);
            await bake(gl, assetInfo, hdr);
            complete?.();
        }
        catch(err){
            await window.api.showError(String(err));
            rejectWithValue(err);
        }
    }
);
async function bake(
    gl: WebGL2RenderingContext,
    assetInfo: AssetManager.AssetInfo,
    hdr: {
        width: number;
        height: number;
        data: Float32Array<ArrayBufferLike>
    }
){
    const floatFBExt = gl.getExtension("EXT_color_buffer_float");
    if(!floatFBExt) throw "Your GPU does not support rendering to RGBA32F textures.";
    const texFloatLinearExt = gl.getExtension('OES_texture_float_linear');
    if(!texFloatLinearExt) throw "Your GPU does not support texture_float_linear.";
    gl.enable(gl.DEPTH_TEST);

    const captureRBO = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, 512, 512);
    const captureFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, captureRBO);
    
    const envCubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, envCubeMap);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for(let i = 0; i < 6; i++){
        gl.texImage2D(
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, 512, 512, 0, gl.RGBA, gl.FLOAT, null
        );
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    const hdrWebglTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, hdrWebglTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const flipedData = flipHdr(hdr);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, hdr.width, hdr.height, 0, gl.RGBA, gl.FLOAT, flipedData);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const captureViewMat4s = [
        mat4.create(), mat4.create(), mat4.create(),
        mat4.create(), mat4.create(), mat4.create()
    ];
    mat4.lookAt(captureViewMat4s[0], [0, 0, 0], [1, 0, 0], [0, -1, 0]); // right
    mat4.lookAt(captureViewMat4s[1], [0, 0, 0], [-1, 0, 0], [0, -1, 0]); // left
    mat4.lookAt(captureViewMat4s[2], [0, 0, 0], [0, 1, 0], [0, 0, 1]); // top
    mat4.lookAt(captureViewMat4s[3], [0, 0, 0], [0, -1, 0], [0, 0, -1]); // bottom
    mat4.lookAt(captureViewMat4s[4], [0, 0, 0], [0, 0, 1], [0, -1, 0]); // font
    mat4.lookAt(captureViewMat4s[5], [0, 0, 0], [0, 0, -1], [0, -1, 0]); // back

    const program = WebglHelper.createProgram(
        gl,
        [
            { type: gl.VERTEX_SHADER, source: cubemapVS },
            { type: gl.FRAGMENT_SHADER, source: equirectangularFS },
        ]
    );
    const modelMat4 = mat4.create();
    mat4.fromRotationTranslationScale(
        modelMat4, quat.fromValues(0, 0, 0, 1), [0, 0, 0], [1, 1, 1]
    );
    const captureClipMat4 = mat4.create();
    mat4.perspective(captureClipMat4, 90 * Math.PI / 180, 1, 0.1, 10);
    const a_PositionLoc  = WebglHelper.getAttrLocation(gl, program, "a_Position");
    const u_ViewMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_ViewMatrix");
    const u_ClipMatrixLoc = WebglHelper.getUniformLocation(gl, program, "u_ClipMatrix");
    const u_equirectangularMapLoc  = WebglHelper.getUniformLocation(gl, program, "u_equirectangularMap");
    const cubeMeshData = getCubeMeshData();
    const vao = gl.createVertexArray();
    const vertexVBO = WebglHelper.createVertexBuffer(gl, cubeMeshData.vertices);
    const indexVBO = WebglHelper.createIndexBuffer(gl, cubeMeshData.vertexIndices);
    gl.bindVertexArray(vao);
        WebglHelper.bindVertexBuffer(gl, vertexVBO);
        gl.vertexAttribPointer(a_PositionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_PositionLoc);
        WebglHelper.bindIndexBuffer(gl, indexVBO);
    gl.bindVertexArray(null);

    gl.useProgram(program);
    gl.uniformMatrix4fv(u_ClipMatrixLoc, false, captureClipMat4);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, hdrWebglTexture);
    gl.uniform1i(u_equirectangularMapLoc, 0);

    gl.viewport(0, 0, 512, 512);
    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
    const hdrImageDatas: Float32Array[] = [];
    // const results: number[][] = [];
    for(let i = 0; i < 6; i++){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(u_ViewMatrixLoc, false, captureViewMat4s[i]);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, envCubeMap, 0
        );
        gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, cubeMeshData.vertexIndices.length, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);

        const pixels = new Float32Array(512 * 512 * 4);
        gl.readPixels(0, 0, 512, 512, gl.RGBA, gl.FLOAT, pixels);
        hdrImageDatas.push(pixels);
        // results.push([...pixels]);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // navigator.clipboard.writeText(JSON.stringify(results));

    WebglHelper.deleteFramebuffer(gl, captureFBO);
    WebglHelper.deleteRenderbuffer(gl, captureRBO);
    WebglHelper.deleteTexture(gl, envCubeMap);
    WebglHelper.deleteTexture(gl, hdrWebglTexture);
    WebglHelper.deleteVertexArray(gl, vao);
    WebglHelper.deleteVertexBuffer(gl, vertexVBO);
    WebglHelper.deleteVertexBuffer(gl, indexVBO);
    WebglHelper.deleteProgram(gl, program);

    const hdrAsset: HdrAsset = {
        enviromentMap: {
            right: { width: 512, height: 512, data: hdrImageDatas[0] },
            left: { width: 512, height: 512, data: hdrImageDatas[1] },
            top: { width: 512, height: 512, data: hdrImageDatas[2] },
            bottom: { width: 512, height: 512, data: hdrImageDatas[3] },
            font: { width: 512, height: 512, data: hdrImageDatas[4] },
            back: { width: 512, height: 512, data: hdrImageDatas[5] },
        }
    }
    await window.api.assetManager.addBakedHdrAsset(assetInfo.uuid, hdrAsset);
}
function flipHdr(
    hdr: {
        width: number;
        height: number;
        data: Float32Array<ArrayBufferLike>
    }
){
    const { width, height, data } = hdr;
    const flipedData = new Float32Array(data.length);
    const rowSize = width * 4;
    let end = width * height * 4;
    let start = 0;
    for(let i = 0; i < height; i++){
        flipedData.set(data.subarray(end - rowSize, end), start);
        end -= rowSize;
        start += rowSize;
    }
    return flipedData;
}
