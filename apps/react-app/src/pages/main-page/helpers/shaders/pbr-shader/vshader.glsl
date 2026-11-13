#version 300 es

uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;
layout (location = 0) in vec3 a_Position;
layout (location = 1) in vec3 a_Normal;
layout (location = 2) in vec2 a_TextCoord;
layout (location = 3) in vec4 a_Tangent;
out vec3 v_WorldPos;
out vec2 v_TextCoord;
out mat3 v_WorldTBN;
void main(){
    gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);

    vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

    vec3 N = a_Normal;
    vec3 T = a_Tangent.xyz;
    N = normalize(u_NormalMatrix * N);
    T = normalize(u_NormalMatrix * T);
    vec3 B = cross(N, T) * a_Tangent.w;
    mat3 TBN = mat3(T, B, N);

    v_WorldPos = vec3(worldPos);
    v_TextCoord = a_TextCoord;
    v_WorldTBN = TBN;
}