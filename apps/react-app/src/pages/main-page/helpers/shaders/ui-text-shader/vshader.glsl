#version 300 es

uniform mat3 u_projectMatrix;
in vec3 a_Position;
in vec2 a_uv;
in vec3 a_color;
in float a_page;
out vec2 v_uv;
out vec3 v_color;
out float v_page;
void main(){
  v_uv = a_uv;
  v_color = a_color;
  v_page = a_page;

  vec3 position = u_projectMatrix * a_Position;
  gl_Position = vec4(position, 1.0);
}