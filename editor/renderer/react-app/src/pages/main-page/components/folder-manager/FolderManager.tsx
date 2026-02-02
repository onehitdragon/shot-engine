import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Folder } from "./Folder";
import { useAppSelector } from "../../../../global-state/hooks";
import { type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import { SelectedFolder } from "./selected-folder";

export function FolderManager(){
    const projectPath = useAppSelector(state => state.folderManager.projectPath);

    return (
        <div className='flex-1 flex overflow-hidden'>
            <div className='flex-2 flex flex-col overflow-hidden'>
                {/* button bar */}
                <div className='flex shadow-lg/10 shadow-black'>
                    <ul className='flex-1 flex'></ul>
                    <ul className='flex-1 flex justify-end'>
                        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                            <ArrowPathIcon className='size-4 text-white'/>
                        </button>
                    </ul>
                </div>
                {/* folder */}
                <div className='flex-1 px-1 py-2 flex flex-col overflow-auto
                    scrollbar-thin'>
                    {
                        projectPath
                        &&
                        <Folder path={projectPath}/>
                    }
                </div>
            </div>
            <div className="w-0.5 bg-gray-400"></div>
            <SelectedFolder />
        </div>
    );
}
