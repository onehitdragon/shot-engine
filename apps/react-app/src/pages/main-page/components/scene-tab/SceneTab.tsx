import { useAppSelector } from "../../../../global-state/hooks";
import { CameraMovement } from "./CameraMovement";
import { Gizmo } from "./Gizmo";
import { SceneRenderer } from "./SceneRenderer";
// import { TestRenderer } from "./test/test";

export function SceneTab(){
    const projectPaths = useAppSelector(state => state.folderManager.projectPaths);

    return (
        projectPaths && <>
            <SceneRenderer />
            <CameraMovement />
            <Gizmo />
        </>
    );
}
