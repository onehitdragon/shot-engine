#version 300 es
precision highp float;

uniform samplerCube u_skyboxSampler;
in vec3 v_WorldPos;
out vec4 fragColor;

void main(){
    vec3 color = texture(u_skyboxSampler, v_WorldPos).rgb;

    // reinhard tone mapping
    color = color / (color + vec3(1.0));

    // gamma correction
    float gamma = 2.2;
    color = pow(color, vec3(1.0/gamma));

    fragColor = vec4(color, 1.0);
}