import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Folder } from "./Folder";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import { SelectedFolder } from "./selected-folder";
import { projectRescanThunk } from "../../../../global-state/thunks/folder-manager-thunks";

export function FolderManager(){
    const projectPaths = useAppSelector(state => state.folderManager.projectPaths);
    const dispatch = useAppDispatch();

    return (
        <div className='flex-1 flex overflow-hidden'>
            <div className='flex-2 flex flex-col overflow-hidden'>
                {/* button bar */}
                <div className='flex shadow-lg/10 shadow-black'>
                    <ul className='flex-1 flex'></ul>
                    <ul className='flex-1 flex justify-end'>
                        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
                            onClick={() => {
                                dispatch(projectRescanThunk());
                            }}>
                            <ArrowPathIcon className='size-4 text-white'/>
                        </button>
                    </ul>
                </div>
                {/* folder */}
                <div className='flex-1 px-1 py-2 flex flex-col overflow-auto
                    scrollbar-thin'>
                    {
                        projectPaths
                        &&
                        <Folder path={projectPaths.asset}/>
                    }
                </div>
            </div>
            <div className="w-0.5 bg-gray-400"></div>
            <SelectedFolder />
        </div>
    );
}
