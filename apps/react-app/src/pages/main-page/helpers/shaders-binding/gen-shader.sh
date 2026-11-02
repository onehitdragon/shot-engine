#!/bin/bash

# cd apps/react-app/src/pages/main-page/helpers/shaders-binding
# ./gen-shader.sh

rm -rf shader-gen

mkdir -p shader-gen/simple-shader
glslang -V -S vert -o shader-gen/simple-shader/shader.vert.spv ./simple-shader/vshader.glsl
glslang -V -S frag -o shader-gen/simple-shader/shader.frag.spv ./simple-shader/fshader.glsl

mkdir -p shader-gen/test
glslang -V -S vert -o shader-gen/test/shader.vert.spv ./test/vshader.glsl
glslang -V -S frag -o shader-gen/test/shader.frag.spv ./test/fshader.glsl
