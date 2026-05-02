#version 300 es

uniform mat4 u_VpMatrix;
in vec4 a_Position;
out vec2 v_WorldPosition;
void main(){
    vec3 vertex = vec3(a_Position);
    float scale = 100.0;
    vertex *= scale;
    gl_Position = u_VpMatrix * vec4(vertex, 1.0);
    v_WorldPosition = vec2(vertex.x, -vertex.z);
}