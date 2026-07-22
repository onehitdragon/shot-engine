#version 300 es
#define PI 3.14159265359

precision highp float;

uniform samplerCube u_enviromentMap;
uniform float u_roughness;
in vec3 v_WorldPos;
out vec4 fragColor;

float RadicalInverse_VdC(uint bits){
  bits = (bits << 16u) | (bits >> 16u);
  bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
  bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
  bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
  bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
  return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}
vec2 Hammersley(uint i, uint N){
  return vec2(float(i)/float(N), RadicalInverse_VdC(i));
}
vec3 sampleGGX(vec2 u, float roughness, vec3 forward, vec3 right, vec3 up){
  float a = roughness * roughness;
  float phi = 2.0 * PI * u.y;
  float cosTheta = sqrt((1.0 - u.x) / (1.0 + u.x * (a*a - 1.0)));
  float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

  vec3 H = vec3(0.0);
  H.x = sinTheta * cos(phi);
  H.y = sinTheta * sin(phi);
  H.z = cosTheta;

  H = H.x * right + H.y * up + H.z * forward;

  return H;
}
void main(){
  vec3 R = normalize(v_WorldPos);
  vec3 V = R;
  vec3 N = R;

  vec3 forward = R;
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 right = normalize(cross(up, forward));
  up = normalize(cross(forward, right));

  const uint nSample = 1024u;
  vec3 radiance = vec3(0.0);
  float totalWeight = 0.0;
  for(uint i = 0u; i < nSample; i++){
    vec2 u = Hammersley(i, nSample);
    vec3 H = sampleGGX(u, u_roughness, forward, right, up);
    vec3 L = reflect(-V, H);
    
    float NoL = max(dot(N, L), 0.0);
    if(NoL > 0.0){
      radiance += texture(u_enviromentMap, L).rgb * NoL;
      totalWeight += NoL;
    }
  }

  radiance = radiance / totalWeight;
  
  fragColor = vec4(radiance, 1.0);
}