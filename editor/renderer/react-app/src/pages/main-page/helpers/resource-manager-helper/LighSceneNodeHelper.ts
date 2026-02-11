import { vec3 } from "gl-matrix";

export function getPointLightInfo(sceneNode: SceneFormat.SceneNode){
    let position: vec3 | null = null;
    let color: vec3 | null = null;
    for(const component of sceneNode.components){
        if(component.type === "Transform"){
            position = component.position;
        }
        if(component.type === "Light" && component.lightType === "PointLight"){
            color = component.color;
        }
    }
    if(!position || !color) throw `sceneNode:${sceneNode.name} dont have PointLight component`;
    return { position, color };
}
export function getDirectionalLightInfo(sceneNode: SceneFormat.SceneNode){
    let dir: vec3 | null = null;
    let color: vec3 | null = null;
    for(const component of sceneNode.components){
        if(component.type === "Light" && component.lightType === "DirectionalLight"){
            dir = component.dir;
            color = vec3.fromValues(1.0, 1.0, 1.0);
        }
    }
    if(!dir || !color) throw `sceneNode:${sceneNode.name} dont have DirectionalLight component`;
    return { dir, color };
}
