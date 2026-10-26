export interface EncodeLdrImageOptions{
  /** default 50 range [1,100]*/
  quality?: number;
  /** default 1 range [0,10]*/
  effort?: number;
  /** default false */
  linear?: boolean;
  /** default true */
  srgb?: boolean;
  /** default false */
  normal?: boolean;
  /** default false */
  yFlip?: boolean;
  /** default false */
  mipmapGen?: boolean;
  /** default 1 */
  mipmapScale?: number;
  /** default kaiser */
  mipmapFilter?: "box" | "tent" | "bell" | "b-spline" | "mitchell" | "blackman" | "lanczos3" | 
    "lanczos4" | "lanczos6" | "lanczos12" | "kaiser" | "gaussian" | "catmullrom" |
    "quadratic_interp" | "quadratic_approx" | "quadratic_mix";
    /** default true */
  mipmapWrapping?: boolean;
  /** default true */
  mipmapFast?: boolean;
  /** default 1 */
  mipmapSmallestDimemsion?: number
  /** default false */
  debug?: boolean
}
export interface EncodeLdrImage{
  (
    imagePath: string | { data: Uint8Array, width: number, height: number },
    options?: EncodeLdrImageOptions
  ): Uint8Array;
}
export interface Addon{
  encodeLdrImage: EncodeLdrImage
};
