import { v4 as uuidv4 } from 'uuid';
import type { Imports } from '../../../../engine-zod';

export function extIsImage(ext: string){
    return (ext === ".png" || ext === ".jpg");
}
export function createDefaultTexture(){
    const texture: Imports.Texture = {
        id: uuidv4(),
        type: "Image",
        imageType: "Texture",
        sRGB: true,
        qualityLevel: 255,
        generateMipmaps: true,
        wrapMode: "REPEAT",
        filterMode: "BILINEAR"
    };
    return texture;
}