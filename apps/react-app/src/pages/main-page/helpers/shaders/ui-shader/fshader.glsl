#version 300 es
precision highp float;

in vec3 v_bgColor;
out vec4 fragColor;
void main(){
  fragColor = vec4(v_bgColor, 1.0);
}