#version 310 es
precision highp float;

layout(set = 3, binding = 0) uniform FragmentUniforms{
  vec3 u_color;
};
layout(location = 0) out vec4 fragColor;
void main(){
  fragColor = vec4(u_color, 1.0);
}