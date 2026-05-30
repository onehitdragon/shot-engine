#version 300 es

in vec3 a_Position;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ClipMatrix;

out vec3 v_WorldPos;

void main(){
    v_WorldPos = a_Position;
    gl_Position = u_ClipMatrix * u_ViewMatrix * vec4(a_Position, 1.0);
}