#version 300 es

precision highp float;

in vec3 v_WorldPos;
out vec4 fragColor;

void main(){   
    vec2 st = v_WorldPos.xz;

    vec2 grid = abs(fract(st - 0.5) - 0.5) / fwidth(st);
    float line = min(grid.x, grid.y);

    // Just visualize the grid lines directly
    float color = 1.0 - min(line, 1.0);

    color = pow(color, 1.0 / 2.2);
    fragColor = vec4(vec3(color), 1.0 - line);
}
