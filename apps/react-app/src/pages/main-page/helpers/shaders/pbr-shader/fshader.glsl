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

uniform sampler2D u_baseColorSampler; // rgb
uniform float u_metallic; // 0...1
uniform float u_perceptualRoughness; // 0...1
uniform float u_reflectance; // 0...1
uniform vec3 u_emissive; // rgb
uniform float u_ao; // 0...1

uniform samplerCube u_irradianceMap;
uniform samplerCube u_prefilterMap;
uniform sampler2D u_brdfLUT;

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

float DistributionGGX(vec3 N, vec3 H, float roughness){
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}
float GeometrySchlickGGX(float NdotV, float roughness){
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness){
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
vec3 fresnelSchlick(float cosTheta, vec3 F0){
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
float Fd_Lambert(){
    return 1.0 / PI;
}
vec3 BRDF(
    vec3 diffuseColor, vec3 F0, float roughness,
    vec3 N, vec3 V, vec3 L
){
    vec3 H = normalize(V + L);

    // Cook-Torrance BRDF
    float NDF = DistributionGGX(N, H, roughness);   
    float G   = GeometrySmith(N, V, L, roughness);      
    vec3 F    = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);

    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001; // + 0.0001 to prevent divide by zero
    vec3 Fr = numerator / denominator;
    vec3 Fd = (1.0 - F) * diffuseColor * Fd_Lambert();

    float NoL = max(dot(N, L), 0.0);
    return (Fr + Fd) * NoL;
}
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
vec3 ambient(
    vec3 diffuseColor, vec3 F0, float roughness,
    vec3 N, vec3 V
){
    float NoV = max(dot(N, V), 0.0);
    vec3 F = fresnelSchlickRoughness(NoV, F0, roughness);
    vec3 irradiance = texture(u_irradianceMap, N).rgb;
    vec3 Fd = (1.0 - F) * diffuseColor * irradiance;

    vec3 R = reflect(-V, N);
    const float MAX_REFLECTION_LOD = 4.0;
    vec3 prefilteredColor = textureLod(u_prefilterMap, R, roughness * MAX_REFLECTION_LOD).rgb;    
    vec2 brdf = texture(u_brdfLUT, vec2(NoV, roughness)).rg;
    vec3 Fr = prefilteredColor * (F * brdf.x + brdf.y);

    return Fd + Fr;
}

void main(){
    vec3 N = normalize(v_WorldNormal);
    vec3 V = normalize(u_CamWorldPos - v_WorldPos);
    vec4 baseColor = texture(u_baseColorSampler, v_TextCoord);

    vec3 diffuseColor = (1.0 - u_metallic) * baseColor.rgb;
    vec3 F0 = 0.16 * u_reflectance * u_reflectance * (1.0 - u_metallic) + baseColor.rgb * u_metallic;
    float roughness = u_perceptualRoughness * u_perceptualRoughness;

    vec3 totalReflection = vec3(0.0);
    for(int i = 0; i < u_DirectionalLightSize; i++){
        DirectionalLight light = u_DirectionalLights[i];
        vec3 L = normalize(-light.dir);
        totalReflection += BRDF(diffuseColor, F0, roughness, N, V, L) * light.intensity * light.color;
    }
    for(int i = 0; i < u_PointLightSize; i++){
        PointLight light = u_PointLights[i];
        vec3 toLight = light.position - v_WorldPos;
        totalReflection += vec3(0.0) * toLight;
    }

    // ambient
    totalReflection += ambient(diffuseColor, F0, roughness, N, V);

    // emissive
    // totalReflection += u_emissive;

    // exposure

    // reinhard tone mapping
    totalReflection = totalReflection / (totalReflection + vec3(1.0));

    // gamma correction
    float gamma = 2.2;
    totalReflection = pow(totalReflection, vec3(1.0/gamma));

    fragColor = vec4(totalReflection, baseColor.a);
}