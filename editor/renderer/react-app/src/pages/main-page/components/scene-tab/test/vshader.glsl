#version 300 es

uniform mat4 u_MvpMatrix;
layout (location = 0) in vec4 a_Position;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
}