#include "Mesh.hpp"

void Mesh::addVertex(RowVector3f v)
{
    this->vertices.push_back(v);
}

void Mesh::addIndex(uint32_t index)
{
    this->indices.push_back(index);
}

std::vector<RowVector3f> Mesh::getVertices() const
{
    return this->vertices;
}

std::vector<uint32_t> Mesh::getIndices() const
{
    return this->indices;
}
