#pragma once

#include <Eigen/Dense>
#include <vector>
#include <cstdint>
#include "Component.hpp"

using Eigen::RowVector3f;

class Mesh: public Component{
private:
    std::vector<RowVector3f> vertices;
    std::vector<uint32_t> indices;
public:
    void addVertex(RowVector3f v);
    void addIndex(uint32_t index);
    std::vector<RowVector3f> getVertices() const;
    std::vector<uint32_t> getIndices() const;
};
