#version 300 es

uniform mat4 u_MvpMatrix;
in vec4 a_Position;
out vec2 v_WorldPosition;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    v_WorldPosition = vec2(a_Position.x, -a_Position.z);
}