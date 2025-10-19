import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { Folder } from "./Folder";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { selectSelectedFolder, updateDirectory, type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import { SelectedFolder } from "./selected-folder";

export function FolderManager(props: { folderPath: string }){
    const { folderPath } = props;
    const directory = useAppSelector(state => state.folderManager.directory);
    const selectedDirectory = useAppSelector(selectSelectedFolder);
    const dispatch = useAppDispatch();
    const loadDirectory = async () => {
        const oldDirectory = directory;
        const newDirectory = await window.api.folder.load(folderPath);
        const map = new Map<string, FolderManager.DirectoryState>();
        function createDirectoryMap(directory: FolderManager.DirectoryState){
            map.set(directory.path, directory);
            for(const entry of directory.children){
                if(entry.type == "Directory") createDirectoryMap(entry);
            }
        }
        if(oldDirectory != null) createDirectoryMap(oldDirectory);
        function diffDirectory(directory: FolderManager.DirectoryState){
            const old = map.get(directory.path);
            if(old) directory.expanding = old.expanding;
            for(const entry of directory.children){
                if(entry.type == "Directory") diffDirectory(entry);
            }
        }
        diffDirectory(newDirectory);
        dispatch(updateDirectory({ directory: newDirectory }));
    }
    useEffect(() => {
        if(!directory) loadDirectory();
    }, []);

    return (
        <div className='flex-1 flex overflow-hidden'>
            <div className='flex-2 flex flex-col overflow-hidden'>
                {/* button bar */}
                <div className='flex shadow-lg/10 shadow-black'>
                    <ul className='flex-1 flex'></ul>
                    <ul className='flex-1 flex justify-end'>
                        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
                            onClick={loadDirectory}>
                            <ArrowPathIcon className='size-4 text-white'/>
                        </button>
                    </ul>
                </div>
                {/* folder */}
                <div className='flex-1 px-1 py-2 flex flex-col overflow-auto
                    scrollbar-thin'>
                    {
                        directory
                        &&
                        <Folder directory={directory}/>
                    }
                </div>
            </div>
            <div className="w-0.5 bg-gray-400"></div>
            {
                selectedDirectory ?
                <SelectedFolder directory={selectedDirectory}/> :
                <div className='flex-4 bg-gray-500 flex flex-col'></div>
            }
        </div>
    );
}
