#include "./Renderer.hpp"
#include "Renderer.hpp"

Renderer::Renderer(
    int width,
    int height,
    FrameBuffer::FormatType formatType,
    FrameBuffer::DepthType depthType)
{
    this->width = width;
    this->height = height;
    this->formatType = formatType;
    this->depthType = depthType;
}

Renderer::~Renderer()
{
}

int Renderer::GetWidth() const
{
    return this->width;
}
int Renderer::GetHeight() const
{
    return this->height;
}
FrameBuffer::FormatType Renderer::GetFormatType() const
{
    return this->formatType;
}

FrameBuffer::DepthType Renderer::GetDepthType() const
{
    return this->depthType;
}
