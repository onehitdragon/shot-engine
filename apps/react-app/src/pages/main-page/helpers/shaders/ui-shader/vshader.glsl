#version 300 es

uniform mat3 u_projectMatrix;
in vec3 a_Position;
in vec3 a_bgColor;
out vec3 v_bgColor;
void main(){
  v_bgColor = a_bgColor;
  vec3 position = u_projectMatrix * a_Position;
  gl_Position = vec4(position, 1.0);
}