#version 300 es
#define PI 3.14159265359

precision highp float;

uniform samplerCube u_enviromentMap;
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
// u - uniform random 0->1
vec3 getSampleVector(vec2 u, vec3 forward, vec3 right, vec3 up){
    float r = sqrt(u.x);
    float theta = u.y * 2.0 * PI;
    vec3 sv = vec3(0.0); // sample vector in tangent
    sv.x = r * cos(theta);
    sv.y = r * sin(theta);
    sv.z = sqrt(1.0 - u.x);

    // sv -> world
    sv = sv.x * right + sv.y * up + sv.z * forward;
    return sv;
}

void main(){
    vec3 N = normalize(v_WorldPos);
    vec3 irradiance = vec3(0.0);

    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, N));
    up = normalize(cross(N, right));

    uint nSample = 5000u;
    for(uint i = 0u; i < nSample; i++)
    {
        vec2 u = Hammersley(i, nSample);
        vec3 sampleVec = getSampleVector(u, N, right, up);
        irradiance += texture(u_enviromentMap, sampleVec).rgb;
    }
    irradiance = (1.0 / float(nSample)) * irradiance; // just multiply diffuse(p) in scene

    fragColor = vec4(irradiance, 1.0);
}