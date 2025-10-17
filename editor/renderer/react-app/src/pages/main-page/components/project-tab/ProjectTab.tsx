import { useAppSelector } from "../../../../global-state/hooks";
import { FolderManager } from "../folder-manager/FolderManager";

export function ProjectTab(){
    const loaded = useAppSelector(state => state.project.loaded);
    const folderPath = useAppSelector(state => state.project.folderPath);
    
    return (
        loaded &&
        <FolderManager folderPath={folderPath}/>
    );
}