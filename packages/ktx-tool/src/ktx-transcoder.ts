import BASIS, { type BasisModule, type KTX2ImageLevelInfo } from "./basis_encoder/basis_encoder.js";

export class KTXTranscoder{
  private static _instance: KTXTranscoder;
  public static getInstance(){
    if(!this._instance){
      this._instance = new KTXTranscoder();
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
  public async transcode(ktx2: Uint8Array, type: "rgba" | "bc1" | "bc3" | "bc5"){
    if(!this._inited) throw "call init() before call this function";
    if(!this._basisModule) throw "fail to init this._basisModule";

    const result: { info: KTX2ImageLevelInfo, compressed: Uint8Array }[] = [];

    const basisModule = this._basisModule;
    const { initializeBasis, KTX2File, transcoder_texture_format } = basisModule;
    initializeBasis();

    const ktx2File = new KTX2File(ktx2);
    if(!ktx2File.isValid()) throw "error: ktx2File.isValid()";
    if(!ktx2File.startTranscoding()) throw "error: startTranscoding";

    const layerIdx = 0;
    const faceIdx = 0;
    const nLevel = ktx2File.getLevels();
    let format: number;
    if(type === "rgba") format = transcoder_texture_format.cTFRGBA32.value;
    else if(type === "bc1") format = transcoder_texture_format.cTFBC1_RGB.value;
    else if(type === "bc3") format = transcoder_texture_format.cTFBC3_RGBA.value;
    else if(type === "bc5") format = transcoder_texture_format.cTFBC5_RG.value;
    else throw "error cant pick format";

    for(let levelIdx = 0; levelIdx < nLevel; levelIdx++){
      const imageLevelInfo = ktx2File.getImageLevelInfo(levelIdx, layerIdx, faceIdx);
      const size = ktx2File.getImageTranscodedSizeInBytes(levelIdx, layerIdx, faceIdx, format);
      const outBuffer = new Uint8Array(size);
      const flags = 0;
      const status = ktx2File.transcodeImageWithFlags(
        outBuffer, levelIdx, layerIdx, faceIdx, format, flags, -1, -1
      );
      if(status === 0) throw "error: transcodeImageWithFlags";
      result.push({ info: imageLevelInfo, compressed: outBuffer });
    }

    return result;
  }
}