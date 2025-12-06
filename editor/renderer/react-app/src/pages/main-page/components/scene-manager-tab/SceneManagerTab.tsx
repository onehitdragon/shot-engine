import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { updateSceneModified, updateScene, updateScenePath } from "../../../../global-state/slices/scene-manager-slice";
import { SceneGraph } from "./SceneGraph";

export function SceneManagerTab(){
    const sceneGraph = useAppSelector(state => state.sceneManager.sceneGraph);
    const dispatch = useAppDispatch();

    const createEmptyScene = () => {
        dispatch(updateScene({ sceneGraph: {
            name: "EmptyScene",
            nodes: []
        } }));
        dispatch(updateScenePath({ path: null }));
        dispatch(updateSceneModified({ value: true }));
    }

    return (
        !sceneGraph ?
        <div className="flex flex-1 justify-center items-center">
            <button className="text-sm text-white px-3 py-1 bg-gray-600 rounded-3xl transition
                hover:cursor-pointer hover:opacity-80"
                onClick={createEmptyScene}
            >
                Create scene
            </button>
        </div>
        :
        <SceneGraph sceneGraph={sceneGraph}/>
    );
}