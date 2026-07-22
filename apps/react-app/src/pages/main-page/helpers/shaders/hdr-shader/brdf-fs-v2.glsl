#version 300 es
#define PI 3.14159265359

precision highp float;

in vec2 v_TextCoord;
out vec2 fragColor;

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
float GeometrySchlickGGX(float NdotV, float roughness){
  float alpha = roughness * roughness;
  float k = alpha * 0.5;

  float nom   = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return nom / denom;
}
float GeometrySmith(float NdotV, float NdotL, float roughness){
  float ggx2 = GeometrySchlickGGX(NdotV, roughness);
  float ggx1 = GeometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

void main() 
{
  float NoV = v_TextCoord.x;
  float roughness = v_TextCoord.y;
  
  vec3 V = vec3(0.0);
  V.z = NoV;
  V.x = sqrt(1.0 - V.z * V.z);

  vec3 N = vec3(0.0, 0.0, 1.0);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 right = vec3(1.0, 0.0, 0.0);
  
  uint nSample = 1024u;
  float A = 0.0;
  float B = 0.0;
  for(uint i = 0u; i < nSample; i++){
    vec2 u = Hammersley(i, nSample);
    vec3 H = sampleGGX(u, roughness, N, right, up);
    vec3 L = reflect(-V, H);

    float VoH = max(dot(V, H), 0.0);
    float NoH = max(H.z, 0.0);
    float NoL = max(L.z, 0.0);
    if(NoL > 0.0){
      float G = GeometrySmith(NoV, NoL, roughness);
      float i1 = (G * VoH) / (NoV * NoH);
      float i2 = pow(1.0 - VoH, 5.0);
      A += i1 * (1.0 - i2);
      B += i1 * i2;
    }
  }
  A = A / float(nSample);
  B = B / float(nSample);

  fragColor = vec2(A, B);
}
