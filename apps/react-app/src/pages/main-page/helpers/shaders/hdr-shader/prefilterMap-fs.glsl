#version 300 es
#define PI 3.14159265359

precision highp float;

uniform samplerCube u_enviromentMap;
uniform float u_shininess;
in vec3 v_WorldPos;
out vec4 fragColor;

float radicalInverse(uint bits) {
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}
vec2 hammersley(uint i, uint N) {
    return vec2(float(i) / float(N), radicalInverse(i));
}

void main(){
    vec3 R = normalize(v_WorldPos);
    const uint SAMPLE_COUNT = 1024u;
    vec3 result = vec3(0.0);

    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, R));
    up = normalize(cross(R, right));

    for(uint i = 0u; i < SAMPLE_COUNT; i++)
    {
        vec2 p = hammersley(i, SAMPLE_COUNT);
        float theta = acos(pow(1.0 - p.y, 1.0/(u_shininess + 1.0)));
        float phi = 2.0 * PI * p.x;
        vec3 tangentSample = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
        vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * R;
        result += texture(u_enviromentMap, sampleVec).rgb;
    }
    result = result / float(SAMPLE_COUNT) * (u_shininess + 2.0) / (u_shininess + 1.0);

    fragColor = vec4(result, 1.0);
}