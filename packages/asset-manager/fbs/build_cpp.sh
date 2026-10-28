#!/bin/bash

echo "remove fbs-gen-cpp folder"
rm -rf fbs-gen-cpp

echo "generating"
flatc --cpp --gen-all -o fbs-gen-cpp ./fbs/engine.fbs

flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/image-asset.fbs
flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/mesh-asset.fbs
flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/prefab-asset.fbs
flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/scene-asset.fbs
flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/hdr-asset.fbs
flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/project-setting-asset.fbs
flatc --cpp --no-warnings -o fbs-gen-cpp ./fbs/assets/font-asset.fbs
