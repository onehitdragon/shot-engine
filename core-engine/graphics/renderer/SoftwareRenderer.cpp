#include "SoftwareRenderer.hpp"
#include <algorithm>

SoftwareRenderer::SoftwareRenderer(
    int width,
    int height,
    FrameBuffer::FormatType formatType,
    FrameBuffer::DepthType depthType
):Renderer(width, height, formatType, depthType){
    int size = width * height;

    if(formatType == FrameBuffer::FormatType::RGB24){
        this->buffer = new uint8_t[size * 3];
    }
    else if(formatType == FrameBuffer::FormatType::RGBA32){
        this->buffer = new uint8_t[size * 4];
    }
    else{
        this->buffer = nullptr;
    }

    if(depthType == FrameBuffer::DepthType::Depth16){
        this->depthBuffer = new uint16_t[size];
        std::fill(
            static_cast<uint8_t*>(this->depthBuffer),
            static_cast<uint8_t*>(this->depthBuffer) + size,
            UINT16_MAX
        );
    }
    else if(depthType == FrameBuffer::DepthType::Depth32){
        this->depthBuffer = new uint32_t[size];
        std::fill(
            static_cast<uint32_t*>(this->depthBuffer),
            static_cast<uint32_t*>(this->depthBuffer) + size,
            UINT32_MAX
        );
    }
    else{
        this->depthBuffer = nullptr;
    }
}
SoftwareRenderer::~SoftwareRenderer()
{
    delete[] this->buffer;
    this->buffer = nullptr;
    delete[] static_cast<uint32_t*>(this->depthBuffer);
    this->depthBuffer = nullptr;
}

int SoftwareRenderer::GetType() const{
    return Renderer::SOFTWARE;
}
