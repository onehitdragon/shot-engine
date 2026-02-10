import { v4 as uuidv4 } from 'uuid';

export function createEmptyScene(){
    const scene: SceneFormat.Scene = {
        id: uuidv4(),
        name: "EmptyScene",
        nodes: []
    }
    return scene;
}
