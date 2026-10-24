import BASIS, { type BasisModule } from "./basis_encoder/basis_encoder.js";
import fs from "fs/promises";
import sharp from "sharp";

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
  private _basisModule?: BasisModule;
  private constructor(){
    this._inited = false;
  }
  public async init(){
    if(this._inited) return;
    this._basisModule = await BASIS();
    this._inited = true;
  }
  /**
   * @param imagePath full path of image
   * @param sRGB true for sRGB, false for Linear
   * @param genMipmap
   */
  public async encodeTexture(
    imagePath: string | Uint8Array,
    sRGB: boolean,
    genMipmap: boolean
  ){
    if(!this._inited) throw "call init() before call this function";
    if(!this._basisModule) throw "fail to init this._basisModule";
    
    const imageSharp = sharp(imagePath);
    const { width, height } = await imageSharp.metadata();
    // with ensureAlpha().raw()
    // any number of channel alway ensure 4 channels(rgba)
    const imageRawBuffer = await imageSharp.ensureAlpha().raw().toBuffer();

    const basisModule = this._basisModule;
    const { initializeBasis, BasisEncoder, ldr_image_type, basis_tex_format } = basisModule;
    initializeBasis();
    const encoder = new BasisEncoder();
    // encoder.setDebug(true);
    encoder.setCreateKTX2File(true);
    encoder.setFormatModeAndQualityEffort(basis_tex_format.cETC1S.value, 50, 1, true);

    // --sRGB config
    if(sRGB) encoder.setSRGBPreset();
    else encoder.setLinearPreset();

    // --mipmap config
    if(genMipmap){
      encoder.setMipGen(true);
      // encoder.setMipScale(1); // ignore
      // encoder.setMipFilter(1);
      // encoder.setMipRenormalize(false);
      // encoder.setMipWrapping();
      // encoder.setMipSmallestDimension(1); // ignore
    }
    else{
      encoder.setMipGen(false);
    }

    // --other config
    encoder.setYFlip(true); // true for webgl
    
    // --in
    const imageType = ldr_image_type.cRGBA32.value;
    const success = encoder.setSliceSourceImage(0, imageRawBuffer, width, height, imageType);
    if(!success) throw "error: setSliceSourceImage";

    // --encode
    const safeSize = Math.max(width * height * 4 * 2, 1024 * 1024 * 4); // minimum: 4mb or higher
    const outBuffer = new Uint8Array(safeSize);
    const size = encoder.encode(outBuffer);
    if(size === 0) throw "error: encode";

    // --out
    return outBuffer.subarray(0, size);
  }
  /**
   * 
   * @param imagePath full path of image
   * @param genMipmap
   */
  public async encodeNormalMap(
    imagePath: string | Uint8Array,
    genMipmap: boolean
  ){
    if(!this._inited) throw "call init() before call this function";
    if(!this._basisModule) throw "fail to init this._basisModule";
    
    const imageSharp = sharp(imagePath);
    const { width, height } = await imageSharp.metadata();
    // with ensureAlpha().raw()
    // any number of channel alway ensure 4 channels(rgba)
    const imageRawBuffer = await imageSharp.ensureAlpha().raw().toBuffer();

    const basisModule = this._basisModule;
    const { initializeBasis, BasisEncoder, ldr_image_type, basis_tex_format } = basisModule;
    initializeBasis();
    const encoder = new BasisEncoder();
    // encoder.setDebug(true);
    encoder.setCreateKTX2File(true);
    encoder.setFormatModeAndQualityEffort(basis_tex_format.cETC1S.value, 50, 1, true);

    // --sRGB config
    encoder.setNormalMapPreset();

    // --mipmap config
    if(genMipmap){
      encoder.setMipGen(true);
      // encoder.setMipScale(1); // ignore
      // encoder.setMipFilter(1);
      encoder.setMipRenormalize(true);
      // encoder.setMipWrapping();
      // encoder.setMipSmallestDimension(1); // ignore
    }
    else{
      encoder.setMipGen(false);
    }

    // --other config
    encoder.setYFlip(true); // true for webgl
    
    // --in
    const imageType = ldr_image_type.cRGBA32.value;
    const success = encoder.setSliceSourceImage(0, imageRawBuffer, width, height, imageType);
    if(!success) throw "error: setSliceSourceImage";

    // --encode
    const safeSize = Math.max(width * height * 4 * 2, 1024 * 1024 * 4); // minimum: 4mb or higher
    const outBuffer = new Uint8Array(safeSize);
    const size = encoder.encode(outBuffer);
    if(size === 0) throw "error: encode";

    // --out
    return outBuffer.subarray(0, size);
  }
}

async function main(){
  const imagePath = "./test/4096x4096 Texel Density Texture 1.png";
  const ktx2Path = "./test/4096x4096 Texel Density Texture 1.ktx2";

  const imageSharp = sharp(imagePath);
  const { width, height } = await imageSharp.metadata();
  const imageRawBuffer = await imageSharp.toBuffer();

  console.log(imageRawBuffer.length);

  const basisModule = await BASIS();
  const { initializeBasis, BasisEncoder, ldr_image_type, basis_tex_format } = basisModule;
  initializeBasis();

  const encoder = new BasisEncoder();
  encoder.setDebug(true);
  encoder.setCreateKTX2File(true);
  encoder.setFormatModeAndQualityEffort(basis_tex_format.cETC1S.value, 50, 1, true);

  // --sRGB config
  encoder.setSRGBPreset();
  // encoder.setLinearPreset();
  // encoder.setNormalMapPreset();

  // --mipmap config
  encoder.setMipGen(true);
  // encoder.setMipScale(1); // ignore
  // encoder.setMipFilter(1);
  // encoder.setMipRenormalize(false);
  // encoder.setMipWrapping();
  // encoder.setMipSmallestDimension(1); // ignore

  // --other
  encoder.setYFlip(true); // true for webgl

  //
  const imageType = ldr_image_type.cPNGImage.value;
  if(
    !encoder.setSliceSourceImage(0, imageRawBuffer, width, height, imageType)
  ){
    console.error("error: setSliceSourceImage");
    return;
  }

  //
  const safeSize = Math.max(width * height * 4 * 2, 1024 * 1024 * 4); // minimum: 4mb or higher
  const outBuffer = new Uint8Array(safeSize);
  const size = encoder.encode(outBuffer);
  if(size === 0){
    console.error("error: encode");
    return;
  }
  await fs.writeFile(ktx2Path, outBuffer.subarray(0, size));

  // console.log(basisModule.basis_texture_type.cBASISTexTypeCubemapArray.value);
  // console.log(Object.getPrototypeOf(encoder));
  console.log(size);
}

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
  const levelIdx = 5;
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
