#pragma once

#include "common/FrameBuffer.hpp"

class Renderer{
private:
    int width;
    int height;
    FrameBuffer::FormatType formatType;
    FrameBuffer::DepthType depthType;
public:
    Renderer(
        int width,
        int height,
        FrameBuffer::FormatType formatType,
        FrameBuffer::DepthType depthType
    );
    virtual ~Renderer();

    int GetWidth() const;
    int GetHeight() const;
    FrameBuffer::FormatType GetFormatType () const;
    FrameBuffer::DepthType GetDepthType () const;
    enum {
        OPENGL,
        DIRECTX,
        SOFTWARE
    };
    virtual int GetType () const = 0;
};