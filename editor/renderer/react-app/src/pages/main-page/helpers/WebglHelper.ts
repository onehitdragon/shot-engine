export class WebglHelper{
    static createProgram(
        gl: WebGL2RenderingContext,
        shaderSources: { type: number, source: string }[]
    ){
        const program = gl.createProgram();
        for(const { type, source } of shaderSources){
            const shader = this.createShader(gl, type, source);
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        return program;
    }
    static createShader(
        gl: WebGL2RenderingContext,
        type: number, source: string
    ){
        const shader = gl.createShader(type);
        if(shader == null) throw `Cant create shader with source: ${source}`;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(shader);
        return shader;
    }
    static createVertexBuffer(
        gl: WebGL2RenderingContext,
        data: Float32Array
    ){
        const buffer = gl.createBuffer();
        this.bindVertexBuffer(gl, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    }
    static createIndexBuffer(
        gl: WebGL2RenderingContext,
        data: Uint32Array
    ){
        const buffer = gl.createBuffer();
        this.bindIndexBuffer(gl, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    }
    static bindVertexBuffer(gl: WebGL2RenderingContext, buffer: WebGLBuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    }
    static bindIndexBuffer(gl: WebGL2RenderingContext, buffer: WebGLBuffer){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
    static getUniformLocation(gl: WebGL2RenderingContext, program: WebGLProgram, name: string){
        const u_Loc = gl.getUniformLocation(program, name);
        if(!u_Loc) throw `uniform ${name} dont exist`;
        return u_Loc;
    };
    static getAttrLocation(gl: WebGL2RenderingContext, program: WebGLProgram, name: string){
        const a_Loc = gl.getAttribLocation(program, name);
        if(a_Loc < 0) throw `attribute ${name} dont exist`;
        return a_Loc;
    };
}