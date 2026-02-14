import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { sceneOpenedThunk } from "../../../../global-state/thunks/scene-manager-thunks";
import { createEmptyScene } from "../../helpers/scene-manager-helper/helper";
import { Scene } from "./SceneGraph";

export function SceneManagerTab(){
    const projectPaths = useAppSelector(state => state.folderManager.projectPaths);
    const scene = useAppSelector(state => state.sceneManager.scene);
    const dispatch = useAppDispatch();

    const createEmptySceneClick = () => {
        dispatch(sceneOpenedThunk({
            scene: createEmptyScene(),
            nodes: [],
            components: [],
            path: null,
            modified: true
        }));
    }

    return (
        !projectPaths ? <div></div> :
        !scene ?
        <div className="flex flex-1 justify-center items-center">
            <button className="text-sm text-white px-3 py-1 bg-gray-600 rounded-3xl transition
                hover:cursor-pointer hover:opacity-80"
                onClick={createEmptySceneClick}
            >
                Create scene
            </button>
        </div>
        :
        <Scene scene={scene}/>
    );
}