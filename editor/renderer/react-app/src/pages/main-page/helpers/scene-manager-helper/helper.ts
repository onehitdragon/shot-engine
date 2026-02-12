import { v4 as uuidv4 } from 'uuid';

export function createEmptyScene(){
    const scene: SceneFormat.Scene = {
        id: uuidv4(),
        name: "EmptyScene",
        nodes: []
    }
    return scene;
}
export function loop(
    nodeId: string,
    sceneNodeRecord: Record<string, SceneFormat.SceneNode>,
    result: (node: SceneFormat.SceneNode) => void
){
    const node = sceneNodeRecord[nodeId];
    if(!node) return;
    result(node);
    const { childs } = node;
    for(const child of childs){
        loop(child, sceneNodeRecord, result);
    }
}
