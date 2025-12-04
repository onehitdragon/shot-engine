#pragma once

#include "Renderer.hpp"
#include <cstdint>

class SoftwareRenderer: public Renderer{
private:
    uint8_t *buffer;
    void *depthBuffer;
public:
    void* getDepthBuffer(){
        return this->depthBuffer;
    }
    SoftwareRenderer(
        int width,
        int height,
        FrameBuffer::FormatType formatType,
        FrameBuffer::DepthType depthType
    );
    int GetType() const override;
    ~SoftwareRenderer();
};