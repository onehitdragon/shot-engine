#version 300 es

in vec3 a_Position;
in vec2 a_TextCoord;

out vec2 v_TextCoord;

void main(){
  v_TextCoord = a_TextCoord;
  gl_Position = vec4(a_Position, 1.0);
}