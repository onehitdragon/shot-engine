#version 300 es

uniform mat4 u_LightSpaceMat4;
layout (location = 0) in vec4 a_Position;
void main(){
    vec4 pos = a_Position;
    pos.x *= 1000.0;
    pos.z *= 1000.0;
    gl_Position = u_LightSpaceMat4 * pos;
}