let glCache: WebGL2RenderingContext | null = null;
export function getSceneCanvas(){
    const canvas = document.getElementById("scene-canvas");
    if(!canvas) throw "dont find canvas with id scene-canvas";
    if(!(canvas instanceof HTMLCanvasElement)) {
        throw "scene-canvas is not a <canvas> element";
    }
    return canvas;
}
export function getSceneWebglContext(){
    if(glCache) return glCache;
    const gl = getSceneCanvas().getContext("webgl2");
    if(!gl) throw "browser dont support webgl2";
    
    const floatFBExt = gl.getExtension("EXT_color_buffer_float");
    if(!floatFBExt) throw "Your GPU does not support rendering to RGBA32F textures.";
    const texFloatLinearExt = gl.getExtension('OES_texture_float_linear');
    if(!texFloatLinearExt) throw "Your GPU does not support texture_float_linear.";

    glCache = gl;
    return gl;
}