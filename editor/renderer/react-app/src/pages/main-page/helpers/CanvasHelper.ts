let glCache: WebGL2RenderingContext | null = null;
export function getSceneWebglContext(){
    if(glCache) return glCache;
    const canvas = document.getElementById("scene-canvas");
    if(!canvas) throw "dont find canvas with id scene-canvas";
    if(!(canvas instanceof HTMLCanvasElement)) {
        throw "scene-canvas is not a <canvas> element";
    }
    const gl = canvas.getContext("webgl2");
    if(!gl) throw "browser dont support webgl2";
    glCache = gl;
    return gl;
}