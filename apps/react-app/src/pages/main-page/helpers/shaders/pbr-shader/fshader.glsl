#version 300 es
#define NUM_LIGHTS 32
#define PI 3.14159265

precision highp float;

struct DirectionalLight {
    vec3 color;
    float intensity;
    vec3 dir; // other
};
struct PointLight {
    vec3 color;
    float intensity;
    float radius;
    vec3 position; // other
};
struct SpotLight {
    vec3 color;
    float intensity;
    float radius;
    float innerAngle;
    float outerAngle;
    vec3 position; // other
    vec3 dir;
};

uniform vec3 u_CamWorldPos;
uniform DirectionalLight u_directionalLights[NUM_LIGHTS];
uniform int u_directionalLightSize;
uniform PointLight u_pointLights[NUM_LIGHTS];
uniform int u_pointLightSize;
uniform SpotLight u_spotLights[NUM_LIGHTS];
uniform int u_spotLightSize;

uniform bool u_hasNormalMap;
uniform sampler2D u_normalMap;
uniform bool u_hasAoMap;
uniform sampler2D u_aoMap;

uniform sampler2D u_baseColorSampler; // rgb
uniform float u_metallic; // 0...1
uniform bool u_hasMetallicMap;
uniform sampler2D u_metallicMap;
uniform float u_perceptualRoughness; // 0...1
uniform bool u_hasRoughnessMap;
uniform sampler2D u_roughnessMap;
uniform float u_reflectance; // 0...1
uniform vec3 u_emissive; // rgb
uniform float u_emissiveIntensity;
uniform bool u_hasEmissiveMap;
uniform sampler2D u_emissiveMap;

uniform bool u_hasIBL;
uniform samplerCube u_irradianceMap;
uniform samplerCube u_prefilterMap;
uniform sampler2D u_brdfLUT;

in vec3 v_WorldPos;
in vec3 v_WorldNormal;
in vec2 v_TextCoord;
in mat3 v_WorldTBN;

out vec4 fragColor;

float invertSquareAtt(float r, float d){
    if (d >= r) return 0.0;
    float t1 = 1.0 / (1.0 + d*d);
    float ratio = d / r;
    float ratio2 = ratio * ratio;
    float t2 = 1.0 - ratio2 * ratio2;
    float att = t1 * (t2 * t2);
    return att;
}
float spotAtt(float cosTheta, float cosInner, float cosOuter){
    if(cosTheta > cosInner) return 1.0;
    if(cosTheta < cosOuter) return 0.0;
    return (cosTheta - cosOuter) / (cosInner - cosOuter);
}
vec3 pointLightIntensity(PointLight light, vec3 point){
    float d = distance(light.position, point);
    return light.color * light.intensity * invertSquareAtt(light.radius, d);
}
vec3 spotLightIntensity(SpotLight light, vec3 point, vec3 L){
    float d = distance(light.position, point);
    float cosTheta = dot(light.dir, L);
    float cosInner = cos(light.innerAngle);
    float cosOuter = cos(light.outerAngle);
    return light.color * light.intensity 
    * invertSquareAtt(light.radius, d) * spotAtt(cosTheta, cosInner, cosOuter);
}

vec3 getWorldNormal(){
    if(u_hasNormalMap){
        vec3 normal = texture(u_normalMap, v_TextCoord).rgb;
        normal = normal * 2.0 - 1.0;
        normal = normalize(v_WorldTBN * normal);
        return normal;
    }
    return normalize(v_WorldNormal);
}
float getMetallic(){
    if(u_hasMetallicMap){
        return texture(u_metallicMap, v_TextCoord).b; // b metallic in gltf
    }
    return u_metallic;
}
float getRoughness(){
    if(u_hasRoughnessMap){
        return texture(u_roughnessMap, v_TextCoord).g; // g roughness in gltf
    }
    return u_perceptualRoughness;
}
vec3 getEmissive(){
    if(u_hasEmissiveMap){
        return texture(u_emissiveMap, v_TextCoord).rgb * u_emissiveIntensity;
    }
    return u_emissive * u_emissiveIntensity;
}
float getAo(){
    if(u_hasAoMap){
        return texture(u_aoMap, v_TextCoord).r; // r in gltf
    }
    return 1.0;
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
vec3 ambient(
    vec3 diffuseColor, vec3 F0, float roughness,
    vec3 N, vec3 V
){
    if(!u_hasIBL) return vec3(0.0);

    float NoV = max(dot(N, V), 0.0);
    vec3 F = fresnelSchlick(NoV, F0);
    vec3 irradiance = texture(u_irradianceMap, N).rgb;
    vec3 Fd = (1.0 - F) * diffuseColor * irradiance;

    vec3 R = reflect(-V, N);
    const float MAX_REFLECTION_LOD = 4.0;
    vec3 prefilteredColor = textureLod(u_prefilterMap, R, roughness * MAX_REFLECTION_LOD).rgb;    
    vec2 brdf = texture(u_brdfLUT, vec2(NoV, roughness)).rg;
    vec3 Fr = prefilteredColor * (F0 * brdf.x + brdf.y);

    return Fd + Fr;
}

void main(){
    vec3 N = getWorldNormal();
    vec3 V = normalize(u_CamWorldPos - v_WorldPos);
    vec4 baseColor = texture(u_baseColorSampler, v_TextCoord);
    float metallic = getMetallic();
    float roughness = getRoughness();

    vec3 diffuseColor = (1.0 - metallic) * baseColor.rgb;
    vec3 F0 = 0.16 * u_reflectance * u_reflectance * (1.0 - metallic) + baseColor.rgb * metallic;

    vec3 totalReflection = vec3(0.0);
    for(int i = 0; i < u_directionalLightSize; i++){
        DirectionalLight light = u_directionalLights[i];
        vec3 L = normalize(-light.dir);
        vec3 Li = light.color * light.intensity;
        totalReflection += BRDF(diffuseColor, F0, roughness, N, V, L) * Li;
    }
    for(int i = 0; i < u_pointLightSize; i++){
        PointLight light = u_pointLights[i];
        vec3 L = normalize(light.position - v_WorldPos);
        vec3 Li = pointLightIntensity(light, v_WorldPos);
        totalReflection += BRDF(diffuseColor, F0, roughness, N, V, L) * Li;
    }
    for(int i = 0; i < u_spotLightSize; i++){
        SpotLight light = u_spotLights[i];
        vec3 L = normalize(light.position - v_WorldPos);
        vec3 Li = spotLightIntensity(light, v_WorldPos, -L);
        totalReflection += BRDF(diffuseColor, F0, roughness, N, V, L) * Li;
    }

    // ambient
    totalReflection += ambient(diffuseColor, F0, roughness, N, V) * getAo();

    // emissive
    totalReflection += getEmissive();

    // exposure

    // reinhard tone mapping
    totalReflection = totalReflection / (totalReflection + vec3(1.0));

    // gamma correction
    float gamma = 2.2;
    totalReflection = pow(totalReflection, vec3(1.0/gamma));

    fragColor = vec4(totalReflection, baseColor.a);
}