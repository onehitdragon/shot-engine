#include "Transform.hpp"

void Transform::setPosition(float x, float y, float z)
{
    position = RowVector3f(x, y, z);
}

void Transform::setRotation(float x, float y, float z)
{
    Quaternionf yaw(AngleAxisf(y, RowVector3f::UnitY()));
    Quaternionf pitch(AngleAxisf(x, RowVector3f::UnitX()));
    Quaternionf roll(AngleAxisf(z, RowVector3f::UnitZ()));
    rotation = roll * pitch * yaw;
}

void Transform::setScale(float x, float y, float z)
{
    scale = RowVector3f(x, y, z);
}

RowVector3f Transform::getPosition()
{
    return this->position;
}

Quaternionf Transform::getRotation()
{
    return this->rotation;
}

RowVector3f Transform::getScale()
{
    return this->scale;
}

Matrix4f Transform::getMatrix()
{
    Matrix4f S = Matrix4f::Identity();
    S(0,0) = scale.x();
    S(1,1) = scale.y();
    S(2,2) = scale.z();
    Matrix4f R = Matrix4f::Identity();
    R.block<3, 3>(0, 0) = rotation.toRotationMatrix();
    Matrix4f T = Matrix4f::Identity();
    T(0,3) = position.x();
    T(1,3) = position.y();
    T(2,3) = position.z();

    return S * R * T;
}
