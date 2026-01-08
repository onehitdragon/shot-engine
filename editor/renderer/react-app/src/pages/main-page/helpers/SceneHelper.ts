export function createEmptyScene(){
    const scene: SceneFormat.Scene = {
        name: "EmptyScene",
        sceneGraph: { nodes: [] },
        meshes: []
    }
    return scene;
}