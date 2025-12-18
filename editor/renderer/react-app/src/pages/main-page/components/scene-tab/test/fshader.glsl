#version 300 es

precision mediump float;
uniform sampler2D u_Texture;
layout (location = 0) out vec4 o_fragColor;
layout (location = 1) out vec4 o_fragColor2;
void main(){
    o_fragColor2 = vec4(vec3(1.0), 1.0);

    vec2 uv = gl_FragCoord.xy / vec2(600.0);
    float d = texture(u_Texture, uv).r;
    o_fragColor = vec4(vec3(d), 1.0);
}