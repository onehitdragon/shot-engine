import path from "path";
import basis_encoder from "./basis_encoder.js";
import sharp from "sharp";
import fs from "fs/promises";
import { parentPort, workerData } from "worker_threads"

createTextureKTX2Worker();
async function createTextureKTX2Worker(){
    const {sourcePath, destPath, settings} = workerData;
    await createTextureKTX2(sourcePath, destPath, settings);
}
async function createTextureKTX2(
    sourcePath: string,
    destPath: string,
    settings: KTX2.TextureKTX2Settings
){
    const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({resolveWithObject: true});
    const rgbaPixels = data;
    const width = info.width;
    const height = info.height;

    // init
    const Module = await basis_encoder({
        locateFile: (file: string) => path.join(__dirname, "..", "..", "wasm", file)
    });
    const { BasisEncoder, initializeBasis } = Module;
    initializeBasis();
    const encoder = new BasisEncoder();

    // configure
    encoder.setSliceSourceImage(
        0, // sliceIndex
        rgbaPixels,
        info.width,
        info.height,
        false // isGrayscale
    );
    encoder.setUASTC(true);
    encoder.setCreateKTX2File(true);
    encoder.setQualityLevel(settings.qualityLevel);
    encoder.setPerceptual(settings.sRGB);
    encoder.setMipGen(settings.mipGen);

    // encode and write
    const MAX_KTX2_SIZE = width * height * 4 * 2; // safe over-allocation
    const outBuffer = new Uint8Array(MAX_KTX2_SIZE);
    const bytesWritten: number = encoder.encode(outBuffer);
    await fs.writeFile(destPath, outBuffer.subarray(0, bytesWritten));
    encoder.delete();
}

