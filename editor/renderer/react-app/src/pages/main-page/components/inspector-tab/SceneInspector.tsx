import { useAppDispatch } from "../../../../global-state/hooks";
import type { SceneInspector } from "../../../../global-state/slices/inspector-slice";
import { updateScene, updateSceneModified, updateScenePath } from "../../../../global-state/slices/scene-manager-slice";

export function SceneInspector(props: { sceneInspector: SceneInspector, path: string }){
    const { sceneInspector, path } = props;
    const { sceneGraph } = sceneInspector;
    const dispatch = useAppDispatch();

    const openScene = () => {
        dispatch(updateScene({ sceneGraph: sceneGraph }));
        dispatch(updateScenePath({ path: path }));
        dispatch(updateSceneModified({ value: false }));
    }

    return (
        <div className="flex flex-col flex-1 items-center p-1">
            <button className="text-white text-sm px-3 py-1 rounded-2xl bg-gray-600 cursor-pointer
                transition hover:opacity-80" onClick={openScene}
            >
                {`Open ${sceneGraph.name} scene`}
            </button>
        </div>
    );
}