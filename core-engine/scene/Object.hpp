#pragma once

#include <vector>
#include "../components/Component.hpp"

class Object{
private:
    std::vector<Component> components;
public:
    void addComponent(Component c);
};
