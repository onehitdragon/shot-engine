declare module 'msdf-bmfont-xml' {
  export interface BMFontOptions{
    /** what kind of distance field to generate. Defaults to msdf. Must be one of:
     * @msdf
     * Multi-channel signed distance field
     * @sdf
     * Monochrome signed distance field
     * @psdf
     * Monochrome signed pseudo-distance field
    */
    fieldType?: "sdf" | "msdf" | "psdf",
    /** the font size at which to generate the distance field. Defaults to 42 */
    fontSize?: number,
    /** the dimensions of an output texture sheet, normally power-of-2 for GPU usage. Both dimensions default to [512, 512] */
    textureSize?: [number, number],
    /** the characters to include in the bitmap font. Defaults to all ASCII printable characters. */
    charset?: string | string[],
    /** type of output font file. Defaults to xml */
    outputType?: "json" | "xml"
  }

  export interface TexturePage{
    filename: string,
    texture: Buffer
  }

  export interface Font{
    filename: string,
    data: string
  }

  function generateBMFont(
    fontPath: string | Buffer,
    options: BMFontOptions,
    callback: (err: Error | null, textures: TexturePage[], font: Font) => void
  ): void;
  function generateBMFont(
    fontPath: string | Buffer,
    callback: (err: Error | null, textures: TexturePage[], font: Font) => void
  ): void;
  export = generateBMFont;
}
