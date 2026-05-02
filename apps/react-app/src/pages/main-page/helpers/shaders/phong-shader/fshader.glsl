#version 300 es
#define NUM_LIGHTS 32

precision mediump float;
struct PointLight {
    vec3 position;
    vec3 color;
};
struct DirectionalLight {
    vec3 dir;
    vec3 color;
};
uniform vec3 u_CamWorldPos;
uniform vec3 u_ambient;
uniform float u_shininess;
uniform PointLight u_PointLights[NUM_LIGHTS];
uniform int u_PointLightSize;
uniform DirectionalLight u_DirectionalLights[NUM_LIGHTS];
uniform int u_DirectionalLightSize;
uniform sampler2D u_DiffuseSampler;
in vec3 v_WorldPos;
in vec3 v_WorldNormal;
in vec2 v_TextCoord;
out vec4 fragColor;
vec3 reflection(vec3 light, vec3 N, vec3 L, vec3 V){
    vec3 R = reflect(-L, N);
    float NoL = max(dot(N, L), 0.0);
    float RoV = max(dot(R, V), 0.0);
    float spec = (u_shininess > 0.0) ? pow(RoV, u_shininess) : 0.0;
    return light * (NoL + spec);
}
void main(){
    vec3 N = normalize(v_WorldNormal);
    vec3 V = normalize(u_CamWorldPos - v_WorldPos);
    vec3 totalReflection = vec3(0.0);
    totalReflection += u_ambient;
    for(int i = 0; i < u_PointLightSize; i++){
        PointLight pointLight = u_PointLights[i];
        vec3 light = pointLight.color;
        vec3 L = normalize(pointLight.position - v_WorldPos);
        totalReflection += reflection(light, N, L, V);
    }
    for(int i = 0; i < u_DirectionalLightSize; i++){
        DirectionalLight directionalLight = u_DirectionalLights[i];
        vec3 light = directionalLight.color;
        vec3 L = normalize(directionalLight.dir);
        totalReflection += reflection(light, N, L, V);
    }
    vec4 diffuse = texture(u_DiffuseSampler, v_TextCoord);
    vec3 finalColor = diffuse.rgb * totalReflection;

    float gamma = 2.2;
    finalColor = pow(finalColor.rgb, vec3(1.0/gamma));

    fragColor = vec4(finalColor, diffuse.a);
}