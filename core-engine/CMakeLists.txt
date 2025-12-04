cmake_minimum_required(VERSION 3.15...4.0)
project(
    CoreShotEngine
    VERSION 1.0
    LANGUAGES CXX
)
file(GLOB SOURCES
    "main.cpp"
    "graphics/renderer/*.cpp"
    "graphics/renderer/common/*.cpp"
    "scene/*.cpp"
    "components/*.cpp"
)
add_executable(main ${SOURCES})
target_link_options(main PRIVATE -static -static-libstdc++ -static-libgcc)
target_link_libraries(main PRIVATE d3d11 d3dcompiler)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/libs/extracts/eigen-5.0.0)
