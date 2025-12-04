#include <iostream>
#include "graphics/renderer/SoftwareRenderer.hpp"
#include "scene/Object.hpp"
#include "components/Transform.hpp"
#include "components/Mesh.hpp"

int main(){
    SoftwareRenderer *sw = new SoftwareRenderer(
        800,
        600,
        FrameBuffer::FormatType::RGB24,
        FrameBuffer::DepthType::Depth32
    );
    std::cout << "hello world aa: " << sw->GetWidth() << std::endl;

    Object obj;
    Transform transform;
    transform.setPosition(0, 0, 0);
    transform.setRotation(0, 20, 0);
    transform.setScale(1, 1, 1);
    obj.addComponent(transform);
    Mesh mesh;
    mesh.addVertex(RowVector3f(-1, 1, -1));
    mesh.addVertex(RowVector3f(1, 1, -1));
    mesh.addVertex(RowVector3f(1, -1, -1));
    mesh.addIndex(0);
    mesh.addIndex(1);
    mesh.addIndex(2);
    obj.addComponent(mesh);

    std::cout << "hello world aa: " << transform.getScale() << std::endl;

    std::string cmd;
    while(true){
        if(std::getline(std::cin, cmd)) {
            std::cout << "Received: " << cmd << std::endl;
        }
    }

    return 0;
}
