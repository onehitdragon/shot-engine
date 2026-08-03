#version 300 es

uniform mat4 u_lightVPMatrix;
uniform mat4 u_modelMatrix;
in vec3 a_Position;
void main(){
  gl_Position = u_lightVPMatrix * u_modelMatrix * vec4(a_Position, 1.0);
}
