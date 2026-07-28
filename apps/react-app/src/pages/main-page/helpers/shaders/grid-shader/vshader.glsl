#version 300 es

uniform mat4 u_VpMatrix;
in vec4 a_Position;
out vec3 v_WorldPos;
void main(){
    vec3 vertex = vec3(a_Position) * 1000.0;
    v_WorldPos = vertex;

    gl_Position = u_VpMatrix * vec4(vertex, 1.0);
}