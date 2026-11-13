#version 300 es
precision highp float;

const int TRANSPARENT_OPAQUE = 0;
const int TRANSPARENT_MASK = 1;
const int TRANSPARENT_BLEND = 2;

uniform int u_transparentMode;
uniform float u_alphaCutoff;
uniform vec4 u_color;
out vec4 fragColor;

void main(){
    vec4 color = u_color;
    if(u_transparentMode == TRANSPARENT_OPAQUE){
        color.a = 1.0;
    }
    else if(u_transparentMode == TRANSPARENT_MASK){
        if(color.a < u_alphaCutoff){
            discard;
        }
        color.a = 1.0;
    }

    fragColor = color;
}