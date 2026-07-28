#version 300 es

uniform mat4 u_VpMatrix;
in vec4 a_Position;
in vec3 a_Color;
out vec3 v_Color;
void main(){
    v_Color = a_Color;
    gl_Position = u_VpMatrix * a_Position;
}