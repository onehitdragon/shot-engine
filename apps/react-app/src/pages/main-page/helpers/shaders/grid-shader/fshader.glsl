#version 300 es

precision mediump float;
const vec3 c_lineColor = vec3(1.0, 0.0, 0.0);
in vec2 v_WorldPosition;
out vec4 o_fragColor;
void main(){
    vec2 blockSize = vec2(2.0);
    vec2 blockPos = fract(v_WorldPosition / blockSize);
    
    vec2 changeInWorldPosition = fwidth(v_WorldPosition / blockSize);
    float w = clamp(changeInWorldPosition.x + changeInWorldPosition.y, 0.01, 1.0);

    vec2 leftBottom = smoothstep(0.0, w, blockPos);
    vec2 rightTop = smoothstep(0.0, w, vec2(1) - blockPos);
    vec2 mul = leftBottom * rightTop;
    float mulValue = mul.x * mul.y;
    
    o_fragColor = vec4(c_lineColor, 1.0 - mulValue);
}