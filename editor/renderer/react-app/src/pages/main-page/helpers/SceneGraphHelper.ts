export function sceneGraphLooper(
    sceneNodes: SceneFormat.SceneNode[],
    action: (
        sceneNode: SceneFormat.SceneNode,
        parent: SceneFormat.SceneNode | null,
        childIndex: number
    ) => void,
    parent: SceneFormat.SceneNode | null = null
){
    for(let i = 0; i < sceneNodes.length; i++){
        const node = sceneNodes[i];
        action(node, parent, i);
        sceneGraphLooper(node.childs, action, node);
    }
}
export function sceneNodeLooper(
    sceneNode: SceneFormat.SceneNode,
    action: (
        sceneNode: SceneFormat.SceneNode,
        parent: SceneFormat.SceneNode | null,
        childIndex: number
    ) => void,
    parent: SceneFormat.SceneNode | null = null
){
    action(sceneNode, parent, 0);
    sceneGraphLooper(sceneNode.childs, action, sceneNode);
}
