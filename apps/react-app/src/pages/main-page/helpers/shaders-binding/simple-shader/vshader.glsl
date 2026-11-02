#version 310 es

layout(set = 1, binding = 0) uniform VertexUniforms{
  mat4 u_MvpMatrix;
};
layout(location = 0) in vec3 a_Position;
void main(){
  gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
}