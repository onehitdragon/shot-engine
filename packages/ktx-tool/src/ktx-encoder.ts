import BASIS, { type BasisModule } from "./basis_encoder/basis_encoder.js";
import fs from "fs/promises";
import sharp from "sharp";
import { type Addon } from "./addon-type.js";

importAddon();

async function importAddon(){
  let plat = "";
  if(process.platform === "win32") plat = "windows";
  if(process.platform === "linux") plat = "linux";
  if(process.platform === "darwin") plat = "macosx";
  const arch = process.arch;
  const suffix = `${plat}-${arch}`;

  const addon = await import(`./prebuilds/ktx-encoder-${suffix}.node`);
  return addon.default as Addon;
}

/** nodejs only */
export class KTXEncoder{
  private static _instance: KTXEncoder;
  public static getInstance(){
    if(!this._instance){
      this._instance = new KTXEncoder();
    }
    return this._instance;
  }
  private _inited: boolean;
  private _addon?: Addon;
  private _options = {
    quality: 100,
    effort: 0
  };
  private constructor(){
    this._inited = false;
  }
  public async init(){
    if(this._inited) return;
    this._addon = await importAddon();
    this._inited = true;
  }
  /**
   * @param imagePath full path of image
   * @param sRGB true for sRGB, false for Linear
   * @param genMipmap
   */
  public async encodeTexture(
    rgbaRaw: Uint8Array,
    width: number,
    height: number,
    sRGB: boolean,
    genMipmap: boolean,
    flipY: boolean
  ){
    if(!this._inited) throw "call init() before call this function";
    if(!this._addon) throw "fail to init this._addon";

    const outBuffer = await this._addon.encodeLdrImage(
      {
        data: rgbaRaw,
        width,
        height
      },
      {
        quality: this._options.quality,
        effort: this._options.effort,
        srgb: sRGB,
        mipmapGen: genMipmap,
        yFlip: flipY
      }
    )
    return outBuffer;
  }

  /**
   * 
   * @param imagePath full path of image
   * @param genMipmap
   */
  public async encodeNormalMap(
    rgbaRaw: Uint8Array,
    width: number,
    height: number,
    genMipmap: boolean,
    flipY: boolean
  ){
    if(!this._inited) throw "call init() before call this function";
    if(!this._addon) throw "fail to init this._basisModule";

    // swap y -> alpha
    for(let i = 3; i < rgbaRaw.length; i += 4){
      rgbaRaw[i] = rgbaRaw[i - 2];
    }

    // encode
    const outBuffer = await this._addon.encodeLdrImage(
      {
        data: rgbaRaw,
        width,
        height
      },
      {
        quality: this._options.quality,
        effort: this._options.effort,
        normal: true,
        mipmapGen: genMipmap,
        yFlip: flipY
      }
    )
    return outBuffer;
  }
}

async function main(){
  const imagePath = "./test/brickwall.jpg";
  const ktx2Path = "./test/brickwall.ktx2";

  const imageSharp = sharp(imagePath);
  const { width, height } = await imageSharp.metadata();
  const imageRawBuffer = await imageSharp.ensureAlpha().raw().toBuffer();

  const addon = await importAddon();
  const outBuffer = await addon.encodeLdrImage(
    // imagePath
    {
      data: imageRawBuffer,
      width,
      height
    },
    {
      srgb: true,
      mipmapGen: true,
      debug: false
    }
  )
  await fs.writeFile(ktx2Path, outBuffer);
}

// async function main(){
//   const imagePath = "./test/brickwall.jpg";
//   const ktx2Path = "./test/brickwall.ktx2";

//   const imageSharp = sharp(imagePath);
//   const { width, height } = await imageSharp.metadata();
//   const imageRawBuffer = await imageSharp.ensureAlpha().raw().toBuffer();

//   const encoder = KTXEncoder.getInstance();
//   await encoder.init();
//   const outBuffer = await encoder.encodeTexture(imageRawBuffer, width, height, true, true, false);

//   await fs.writeFile(ktx2Path, outBuffer);
// }

async function main2(){
  const ktx2Path = "./test/image-rgba-8-sRGB.ktx2";
  const gpuPath = "./test/image-rgba-8-sRGB.gpu";

  const basisModule = await BASIS();
  const { initializeBasis, KTX2File, transcoder_texture_format, basisu_decode_flags } = basisModule;
  initializeBasis();

  const file = await fs.readFile(ktx2Path);
  const ktx2File = new KTX2File(new Uint8Array(file));
  console.log("isValid", ktx2File.isValid());
  console.log("getWidth", ktx2File.getWidth());
  console.log("getHeight", ktx2File.getHeight());
  console.log("getFaces", ktx2File.getFaces());
  console.log("getLayers", ktx2File.getLayers());
  console.log("getLevels", ktx2File.getLevels());
  console.log("getBasisTexFormat", ktx2File.getBasisTexFormat());
  console.log("isHDR", ktx2File.isHDR());
  console.log("isLDR", ktx2File.isLDR());
  console.log("isETC1S", ktx2File.isETC1S());
  console.log("getHasAlpha", ktx2File.getHasAlpha());
  console.log("isSRGB", ktx2File.isSRGB());

  // --get size
  const levelIdx = 3;
  const layerIdx = 0;
  const faceIdx = 0;
  // cTFETC2_EAC_R11 cTFETC2_EAC_RG11 cTFETC1_RGB cTFETC2_RGBA
  // cTFRGBA32
  const format = transcoder_texture_format.cTFRGBA32.value;
  const imageLevelInfo = ktx2File.getImageLevelInfo(levelIdx, layerIdx, faceIdx);
  const size = ktx2File.getImageTranscodedSizeInBytes(levelIdx, layerIdx, faceIdx, format);
  const { width, height } = imageLevelInfo;

  if(!ktx2File.startTranscoding()){
    console.log("error: startTranscoding");
    return;
  }
  const outBuffer = new Uint8Array(size);
  const flags = 0;
  const status = ktx2File.transcodeImageWithFlags(
    outBuffer, levelIdx, layerIdx, faceIdx, format, flags, -1, -1
  );
  if(status === 0){
    console.error("error: transcodeImageWithFlags");
    return;
  }
  await fs.writeFile(gpuPath, outBuffer);
  
  console.log(imageLevelInfo.origWidth, imageLevelInfo.origHeight);
  console.log(width, height, width * height * 4, outBuffer);
  console.log(size);

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
  .png().toFile("./test/image-rgba-8-sRGB.png");
}

// main();
// main2();
