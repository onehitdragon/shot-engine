#pragma once

#include <Eigen/Dense>
#include "Component.hpp"

using Eigen::RowVector3f;
using Eigen::Quaternionf;
using Eigen::Matrix4f;
using Eigen::AngleAxisf;

class Transform: public Component{
private:
    RowVector3f position;
    Quaternionf rotation;
    RowVector3f scale;
public:
    void setPosition(float x, float y, float z);
    void setRotation(float x, float y, float z);
    void setScale(float x, float y, float z);
    RowVector3f getPosition();
    Quaternionf getRotation();
    RowVector3f getScale();
    Matrix4f getMatrix();
};
