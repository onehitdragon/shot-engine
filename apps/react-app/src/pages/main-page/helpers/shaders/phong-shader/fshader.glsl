#version 300 es
#define NUM_LIGHTS 32
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_2PI 0.15915494309189535

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

uniform sampler2D u_DiffuseSampler;
uniform vec3 u_specular;
uniform float u_shininess;

uniform samplerCube u_irradianceMap;
uniform samplerCube u_prefilterMap;
uniform float u_maxShininess;

uniform PointLight u_PointLights[NUM_LIGHTS];
uniform int u_PointLightSize;
uniform DirectionalLight u_DirectionalLights[NUM_LIGHTS];
uniform int u_DirectionalLightSize;
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
vec3 reflection(vec3 Li, vec3 diffuseColor, vec3 specularColor, float shininess, vec3 N, vec3 L, vec3 V){
    vec3 R = reflect(-L, N);
    float NoL = max(dot(N, L), 0.0);
    float RoV = max(dot(R, V), 0.0);

    vec3 kd = diffuseColor * (1.0 - specularColor);
    vec3 diffuse = kd * RECIPROCAL_PI;
    float normalization = (shininess + 2.0) * RECIPROCAL_2PI;
    vec3 specular = specularColor * normalization * pow(RoV, shininess);

    return (diffuse + specular) * Li * NoL;
}
void main(){
    vec3 N = normalize(v_WorldNormal);
    vec3 V = normalize(u_CamWorldPos - v_WorldPos);
    vec3 diffuse = texture(u_DiffuseSampler, v_TextCoord).rgb;
    vec3 totalReflection = vec3(0.0);
    
    for(int i = 0; i < u_PointLightSize; i++){
        PointLight light = u_PointLights[i];
        vec3 toLight = light.position - v_WorldPos;
        float distanceSq = dot(toLight, toLight);
        float radiusSq = light.radius * light.radius;
        if(distanceSq > radiusSq) continue;
        vec3 Li = calcLi(light.color, light.intensity, radiusSq, distanceSq);
        vec3 L = toLight * inversesqrt(distanceSq);

        totalReflection += reflection(Li, diffuse, u_specular, u_shininess, N, L, V);
    }
    for(int i = 0; i < u_DirectionalLightSize; i++){
        DirectionalLight light = u_DirectionalLights[i];
        totalReflection += vec3(0.0) * light.dir;
    }
    
    vec3 Rv = reflect(-V, N);
    float NoRv = max(dot(N, Rv), 0.0);
    vec3 kd = diffuse * (1.0 - u_specular);
    vec3 ambientDiffuse = kd * texture(u_irradianceMap, N).rgb;
    float level = (u_maxShininess / max(u_shininess, 0.001)) - 1.0;
    vec3 ambientSpecular = u_specular * NoRv * textureLod(u_prefilterMap, Rv, level).rgb;
    vec3 ambient = ambientDiffuse + ambientSpecular;

    vec3 finalColor = ambient + totalReflection;

    // reinhard tone mapping
    finalColor = finalColor / (finalColor + vec3(1.0));

    // gamma correction
    float gamma = 2.2;
    finalColor = pow(finalColor, vec3(1.0/gamma));

    fragColor = vec4(finalColor, 1.0);
}