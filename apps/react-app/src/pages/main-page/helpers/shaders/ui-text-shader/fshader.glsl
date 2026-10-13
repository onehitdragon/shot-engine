#version 300 es

precision highp float;
precision highp sampler2DArray;

uniform sampler2D u_textures[4];
in vec2 v_uv;
in vec3 v_color;
in float v_page;
out vec4 fragColor;
void main(){
  int page = int(v_page);
  float sdf = 0.0;
  switch(page){
    case 0: sdf = texture(u_textures[0], v_uv).r; break;
    case 1: sdf = texture(u_textures[1], v_uv).r; break;
    case 2: sdf = texture(u_textures[2], v_uv).r; break;
    case 3: sdf = texture(u_textures[3], v_uv).r; break;
  }
  float d_sdf = fwidth(sdf);
  float a = smoothstep(0.5 - d_sdf, 0.5 + d_sdf, sdf);
  
  fragColor = vec4(v_color, a);
}