#version 300 es

uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;
in vec3 a_Position;
in vec3 a_Normal;
out vec3 v_WorldPos;
out vec3 v_WorldNormal;
void main(){
    gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
    vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
    vec3 worldNormal = u_NormalMatrix * a_Normal;
    v_WorldPos = vec3(worldPos);
    v_WorldNormal = normalize(worldNormal);
}