export interface LdrImageTypeEnum{
  cRGBA32: { value: number }
  cPNGImage: { value: number }
  cJPGImage: { value: number }
  cQOIImage: { value: number }
}
export interface BasisTexFormatEnum{
  cETC1S: { value: number }
  cUASTC4x4: { value: number }
  cUASTC_LDR_4x4: { value: number }
  cUASTC_HDR_4x4: { value: number }
  cASTC_HDR_6x6: { value: number }
  cUASTC_HDR_6x6_INTERMEDIATE: { value: number }
  cUASTC_HDR_6x6: { value: number }
  cUASTC_HDR_6x6cASTC_HDR_6x6_INTERMEDIATE: { value: number }
}
export interface BasisTextureTypeEnum{
  cBASISTexType2D: { value: number }
  cBASISTexType2DArray: { value: number }
  cBASISTexTypeCubemapArray: { value: number }
  cBASISTexTypeVideoFrames: { value: number }
  cBASISTexTypeVolume: { value: number }
}
export interface TranscoderTextureFormatEnum{
  cTFETC1_RGB: { value: number }
  cTFETC2_RGBA: { value: number }
  cTFBC1_RGB: { value: number }
  cTFBC3_RGBA: { value: number }
  cTFBC4_R: { value: number }
  cTFBC5_RG: { value: number }
  cTFBC7_RGBA: { value: number }
  cTFPVRTC1_4_RGB: { value: number }
  cTFPVRTC1_4_RGBA: { value: number }
  cTFASTC_4x4_RGBA: { value: number }
  cTFATC_RGB: { value: number }
  cTFATC_RGBA: { value: number }
  cTFFXT1_RGB: { value: number }
  cTFPVRTC2_4_RGB: { value: number }
  cTFPVRTC2_4_RGBA: { value: number }
  cTFETC2_EAC_R11: { value: number }
  cTFETC2_EAC_RG11: { value: number }
  cTFBC6H: { value: number }
  cTFASTC_HDR_4x4_RGBA: { value: number }
  cTFRGBA32: { value: number }
  cTFRGB565: { value: number }
  cTFBGR565: { value: number }
  cTFRGBA4444: { value: number }
  cTFRGB_HALF: { value: number }
  cTFRGBA_HALF: { value: number }
  cTFRGB_9E5: { value: number }
  cTFASTC_HDR_6x6_RGBA: { value: number }
  cTFASTC_LDR_5x4_RGBA: { value: number }
  cTFASTC_LDR_5x5_RGBA: { value: number }
  cTFASTC_LDR_6x5_RGBA: { value: number }
  cTFASTC_LDR_6x6_RGBA: { value: number }
  cTFASTC_LDR_8x5_RGBA: { value: number }
  cTFASTC_LDR_8x6_RGBA: { value: number }
  cTFASTC_LDR_10x5_RGBA: { value: number }
  cTFASTC_LDR_10x6_RGBA: { value: number }
  cTFASTC_LDR_8x8_RGBA: { value: number }
  cTFASTC_LDR_10x8_RGBA: { value: number }
  cTFASTC_LDR_10x10_RGBA: { value: number }
  cTFASTC_LDR_12x10_RGBA: { value: number }
  cTFASTC_LDR_12x12_RGBA: { value: number }
  cTFTotalTextureFormats: { value: number }
}
export interface BasisuDecodeFlagsEnum{
  cDecodeFlagsPVRTCDecodeToNextPow2: { value: number }
  cDecodeFlagsTranscodeAlphaDataToOpaqueFormats: { value: number }
  cDecodeFlagsBC1ForbidThreeColorBlocks: { value: number }
  cDecodeFlagsOutputHasAlphaIndices: { value: number }
  cDecodeFlagsHighQuality: { value: number }
  cDecodeFlagsNoETC1SChromaFiltering: { value: number }
  cDecodeFlagsNoDeblockFiltering: { value: number }
  cDecodeFlagsForceDeblockFiltering: { value: number }
  cDecodeFlagXUASTCLDRDisableFastBC7Transcoding: { value: number }
}
export interface KTX2ImageLevelInfo{
  levelIndex: number
  layerIndex: number
  faceIndex: number
  origWidth: number
  origHeight: number
  width: number
  height: number
  numBlocksX: number
  numBlocksY: number
  blockWidth: number
  blockHeight: number
  totalBlocks: number
  alphaFlag: boolean
  iframeFlag: boolean
}

/** KTX2 transcoder class */
export class KTX2FileClass{
  constructor(src: Uint8Array);
  isValid(): boolean;
  getWidth(): number;
  getHeight(): number;
  getFaces(): number;
  getLayers(): number;
  getLevels(): number;
  getBasisTexFormat(): number;
  isHDR(): boolean;
  isLDR(): boolean;
  isETC1S(): boolean;
  getHasAlpha(): boolean;
  isSRGB(): boolean;
  getImageLevelInfo(
    level_index: number,
    layer_index: number,
    face_index: number,
  ): KTX2ImageLevelInfo;
  /** format is transcoder_texture_format */
  getImageTranscodedSizeInBytes(
    level_index: number,
    layer_index: number,
    face_index: number,
    format: number,
  ): number;
  /**
   * @ Must be called before transcodeImage() can be called.
   * @ On ETC1S files this method decompresses the ETC1S global data, along with fetching the ETC1S image desc array, so it's not free to call.
   * @ return 0-error
   */
  startTranscoding(): number;
  /**
   * @ like transcodeImage(), but with fixed parameters (includes flags)
   * @ For flags, see cDecodeFlagsPVRTCDecodeToNextPow2 etc. bitmask
   * @ format is transcoder_texture_format
   * @ layer_index index in texture array
   * @ face_index index in cube face
   * @ format transcoder_texture_format BC7, ETC2, ASTC... 
   * @ flags basisu_decode_flags
   * @ channel0/channel1 default to -1
   */
  transcodeImageWithFlags(
    dst: Uint8Array,
    level_index: number,
    layer_index: number,
    face_index: number,
    format: number,
    flags: number,
    channel0: number,
    channel1: number
  ): number;
}
export class BasisEncoderClass{
  constructor();
  /** Create .KTX2 files instead of .basis files. By default this is FALSE. */
  setCreateKTX2File(create_ktx2_file: boolean): void
  /** 
   * Sets the slice's source image, either from a PNG/JPG file or from a raw 32-bit RGBA raster image.
   * 
   * If the input is a raster image, the buffer must be width\*height\*4 bytes in size. The raster image is stored in top down scanline order.
   * @param img_type LdrImageType
  */
  setSliceSourceImage(
    slice_index: number,
    src_image_js_val: Uint8Array,
    width: number,
    height: number,
    img_type: number
  ): boolean;
  /**
   * @ Sets the desired encoding format. This is the preferred way to control which format/ASTC block size the encoder creates.
   * @ tex_format is a basis_tex_format (cETC1s, cUASTC_LDR_4x4, cUASTC_HDR_4x4 etc.) - see basisu_file_headers.h.
   * @ This can be used instead of the older setUASTC(), setHDR() etc. methods.
   */
  setFormatMode(tex_format: number): void;
  /**
   * @ setFormatModeAndEffortQuality() is like setFormatMode(), except it also sets the effort [0,10] and quality [0,100] parameters to (hopefully) reasonable values for the selected format.
   * @ If effort==-1, no effort related parameters will be modified.
   * @ If quality==-1, no quality related parameters will be modified.
   * @ These values directly correspond to the command line tool's "-effort X" and "-quality X" unified codec compression options.
   * @ If set_defaults is true (recommended) and quality is -1, the default quality settings will be used, otherwise the quality settings will remain unchanged. Same for effort.
   */
  setFormatModeAndQualityEffort(
    tex_format: number, quality: number, effort: number, set_defaults: boolean
  ): void;
  /**
   * @ Compresses the provided source slice(s) to an output .basis file.
   * @ the minimum, you must provided at least 1 source slice by calling setSliceSourceImage() or setSliceSourceImageHDR() (for UASTC HDR) before calling this method.
   * @returns number of bytes has written or 0 -> fail
   */
  encode(dst_basis_file_js_val: Uint8Array): number;
  /**
   * @ If true the source images will be Y flipped before compression.
   * @ All formats
   */
  setYFlip(y_flip_flag: boolean): void;
  /**
   * @ Enables debug output to stdout
   * @ All formats
  */
  setDebug(debug_flag: boolean): void;
  /**
   * @ setNormalMapMode is the same as the basisu.exe "-normal_map" option. It tunes several codec parameters so compression works better on normal maps.
   * @ set_srgb_options(false) + set_ldr_srgb_channel_weights(false)
   * @ m_no_selector_rdo(true) + m_no_endpoint_rdo(true)
   */
  setNormalMapPreset(): void;
  /**
   * @ -linear option
   * @ set_srgb_options(false) + set_ldr_srgb_channel_weights(false)
   */
  setLinearPreset(): void;
  /**
   * @ -srgb option
   * @ set_srgb_options(true) + set_ldr_srgb_channel_weights(true)
   */
  setSRGBPreset(): void;
  /**
   * If true mipmaps will be generated from the source images
   */
  setMipGen(mip_gen_flag: boolean): void;
  /** 
   * @ Set mipmap filter's scale factor
   * @ default is 1, range is [.000125, 4.0]
   */
  setMipScale(mip_scale: number): void;
  /**
   * @ Sets the mipmap filter to apply
   * @ mip_filter must be < BASISU_MAX_RESAMPLER_FILTERS
   * @ See the end of basisu_resample_filters.cpp: g_resample_filters[]
   * @ [0-box, 1-tent, 2-bell, 3-b-spline, 4-mitchell, 10-kaiser]
   * @ default kaiser
   */
  setMipFilter(mip_filter: number): void;
  /**
   * If true, the input is assumed to be a normal map, and the texels of each mipmap will be renormalized before encoding.
   */
  setMipRenormalize(mip_renormalize_flag: boolean): void;
  /**
   * If true the source texture will be sampled using wrap addressing during mipmap generation, otherwise clamp.
   */
  setMipWrapping(mip_wrapping_flag: boolean): void;
  /**
   * @ Sets the mipmap generator's smallest allowed dimension.
   * @ default is 1, range is [1,16384]
   */
  setMipSmallestDimension(mip_smallest_dimension: number): void;
  /**
   * @ Sets the .basis texture type.
   * @ cBASISTexTypeVideoFrames changes the encoder into video mode.
   * @ tex_type is enum basis_texture_type
   * @ default is cBASISTexType2D
   */
  setTexType(tex_type: number): void;
}
export interface BasisModule{
  initializeBasis: () => void,
  setDebugFlags: (flags: number) => void,
  ldr_image_type: LdrImageTypeEnum,
  basis_tex_format: BasisTexFormatEnum,
  basis_texture_type: BasisTextureTypeEnum,
  basisu_decode_flags: BasisuDecodeFlagsEnum,
  transcoder_texture_format: TranscoderTextureFormatEnum,
  KTX2File: typeof KTX2FileClass,
  BasisEncoder: typeof BasisEncoderClass,
}
const BASIS: () => Promise<BasisModule>;
export default BASIS;
