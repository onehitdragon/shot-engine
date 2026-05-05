import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { GameObjectTree } from "./GameObjectTree";

export function GameObjectTreeTab(){
    const projectPaths = useAppSelector(state => state.folderManager.projectPaths);
    const dispatch = useAppDispatch();

    const createEmptySceneClick = () => {
        // dispatch(sceneOpenedThunk({
        //     scene: createEmptyScene(),
        //     nodes: [],
        //     components: [],
        //     path: null,
        //     modified: true
        // }));
    }

    return (
        !projectPaths ? <div></div> :
        // !scene ?
        // <div className="flex flex-1 justify-center items-center">
        //     <button className="text-sm text-white px-3 py-1 bg-gray-600 rounded-3xl transition
        //         hover:cursor-pointer hover:opacity-80"
        //         onClick={createEmptySceneClick}
        //     >
        //         Create scene
        //     </button>
        // </div>
        // :
        <GameObjectTree />
    );
}