#version 300 es
#define NUM_LIGHTS 32
#define PI 3.14159265

precision highp float;

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
    float radius;
};
struct DirectionalLight {
    vec3 dir;
    vec3 color;
    float intensity;
    float radius;
};

uniform vec3 u_CamWorldPos;
uniform PointLight u_PointLights[NUM_LIGHTS];
uniform int u_PointLightSize;
uniform DirectionalLight u_DirectionalLights[NUM_LIGHTS];
uniform int u_DirectionalLightSize;

uniform sampler2D u_albedoSampler;
uniform float u_metallic;
uniform float u_roughness;

in vec3 v_WorldPos;
in vec3 v_WorldNormal;
in vec2 v_TextCoord;

out vec4 fragColor;

vec3 calcLi(vec3 lightColor, float intensity, float radiusSq, float distanceSq){
    float attenuation = 1.0 / (distanceSq + 0.0001);
    float ratio2 = distanceSq / (radiusSq + 0.0001);
    float ratio4 = ratio2 * ratio2;
    float windowing = clamp(1.0 - ratio4, 0.0, 1.0);
    return (lightColor * intensity) * (attenuation * windowing * windowing);
}
vec3 calcF0(vec3 albedo, float metallic){
    vec3 dielectric = vec3(0.04);
    return mix(dielectric, albedo, metallic);
}
vec3 fresnelSchlick(vec3 F0, float cosTheta){
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
float D_GGX(float NoH, float roughness) {
    float a = NoH * roughness;
    float k = roughness / (1.0 - NoH * NoH + a * a);
    return k * k * (1.0 / PI);
}
float V_SmithGGXCorrelated(float NoV, float NoL, float roughness) {
    float a2 = roughness * roughness;
    float GGXV = NoL * sqrt(NoV * NoV * (1.0 - a2) + a2);
    float GGXL = NoV * sqrt(NoL * NoL * (1.0 - a2) + a2);
    return 0.5 / (GGXV + GGXL);
}
vec3 reflection(vec3 Li, vec3 albedo, float metallic, float roughness, vec3 N, vec3 V, vec3 L){
    vec3 H = normalize(L + V);
    float VoH = max(dot(V, H), 0.0);
    float NoH = max(dot(N, H), 0.0);
    float NoL = max(dot(N, L), 0.0);
    float NoV = max(dot(N, V), 0.0);
    vec3 F0 = calcF0(albedo, metallic);
    vec3 F = fresnelSchlick(F0, VoH);
    vec3 kS = F;
    vec3 kD = (vec3(1.0) - kS) * (1.0 - metallic);
    vec3 diffuse = kD * (albedo / PI);
    vec3 specularBRDF = D_GGX(NoH, roughness) * V_SmithGGXCorrelated(NoV, NoL, roughness) * F;

    return (diffuse + specularBRDF) * Li * NoL;
}

void main(){
    vec3 N = normalize(v_WorldNormal);
    vec3 V = normalize(u_CamWorldPos - v_WorldPos);
    vec4 tex = texture(u_albedoSampler, v_TextCoord);
    vec3 albedo = tex.rgb;
    vec3 totalReflection = vec3(0.0);
    for(int i = 0; i < u_PointLightSize; i++){
        PointLight light = u_PointLights[i];
        vec3 toLight = light.position - v_WorldPos;
        float distanceSq = dot(toLight, toLight);
        float radiusSq = light.radius * light.radius;
        if(distanceSq > radiusSq) continue;
        vec3 Li = calcLi(light.color, light.intensity, radiusSq, distanceSq);
        vec3 L = toLight * inversesqrt(distanceSq);
        totalReflection += reflection(Li, albedo, u_metallic, u_roughness, N, V, L);
    }
    for(int i = 0; i < u_DirectionalLightSize; i++){
        DirectionalLight light = u_DirectionalLights[i];
        totalReflection += vec3(0.0) * light.dir;
    }

    vec3 ambient = vec3(0.03) * albedo * (1.0 - u_metallic);
    totalReflection += ambient;

    // reinhard tone mapping
    totalReflection = totalReflection / (totalReflection + vec3(1.0));

    // gamma correction
    float gamma = 2.2;
    totalReflection = pow(totalReflection, vec3(1.0/gamma));

    fragColor = vec4(totalReflection, tex.a);
}