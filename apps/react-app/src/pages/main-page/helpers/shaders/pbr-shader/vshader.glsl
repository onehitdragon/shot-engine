#version 300 es

uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;
in vec3 a_Position;
in vec3 a_Normal;
in vec2 a_TextCoord;
in vec3 a_Tangent;
out vec3 v_WorldPos;
out vec3 v_WorldNormal;
out vec2 v_TextCoord;
out mat3 v_WorldTBN;
void main(){
    gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);

    vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

    vec3 N = a_Normal;
    vec3 T = a_Tangent;
    N = normalize(u_NormalMatrix * N);
    T = normalize(u_NormalMatrix * T);
    T = normalize(T - N * dot(N, T));
    vec3 B = normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    v_WorldPos = vec3(worldPos);
    v_WorldNormal = N;
    v_TextCoord = a_TextCoord;
    v_WorldTBN = TBN;
}