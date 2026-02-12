import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from "@heroicons/react/24/solid";
import { chooseEntry, selectChildren, selectEntryByPath, toggleExpandDirectory, type FolderManager } from '../../../../global-state/slices/folder-manager-slice';
import { useAppDispatch, useAppSelector } from '../../../../global-state/hooks';
import { useMemo } from 'react';

type FolderProps = {
    path: string,
    level?: number
}
export function Folder(props: FolderProps){
    const { path, level = 0 } = props;
    const entry = useAppSelector(state => selectEntryByPath(state, path));
    if(entry.type !== "Directory") throw `${path} is not directory`;
    const directory = entry;
    const children = useAppSelector(state => selectChildren(state, directory.children));
    const isEmpty = children.length == 0;
    const isOnlyFile = useMemo(() => children.every((child) => child.type === "File"), [children]);
    const dispatch = useAppDispatch();
    const selectedPath = useAppSelector(state => state.folderManager.selectedPath);
    const isSelected = selectedPath && selectedPath === entry.path;
    const click = () => {
        if(!isEmpty && !isOnlyFile) dispatch(toggleExpandDirectory({ path: directory.path }));
        dispatch(chooseEntry({ path: directory.path }));
    }

    return (
        <div className='flex flex-col'>
            <div style={{ paddingLeft: level * 16 }} className={`flex items-center hover:bg-gray-600 hover:cursor-pointer
                ${isSelected && "bg-gray-600"}`}
                onClick={click}
            >
                {
                    isEmpty ? (
                        <EmptyEntry directory={directory} />
                    )
                    : isOnlyFile ? (
                        <OnlyFileEntry directory={directory} />
                    )
                    : (
                        <OpenableEntry  directory={directory}/>
                    ) 
                }
            </div>
            {
                directory.expanding
                &&
                <ul className='flex flex-col'>
                    {
                        children.map(child => {
                            if(child.type == 'Directory'){
                                return <Folder key={child.path} path={child.path} level={level + 1}/>
                            }
                        })
                    }
                </ul>
            }
        </div>
    );
}

type EntryProps = {
    directory: FolderManager.DirectoryState
}
function EmptyEntry(props: EntryProps){
    const { directory } = props;

    return (
        <Empty name={directory.name}/>
    );
}
function OnlyFileEntry(props: EntryProps){
    const { directory } = props;

    return (
        <OnlyFile name={directory.name}/>
    );
}
type OpenableEntryProps = EntryProps & {}
function OpenableEntry(props: OpenableEntryProps){
    const { directory } = props;

    return (
        directory.expanding ? 
        <Expanding name={directory.name}/> :
        <Collapsed name={directory.name}/>
    );
}
function Empty(props: { name: string }){
    return (
        <>
            <div className='size-4 text-white'/>
            <FolderEmptyIcon className='size-4 text-yellow-500'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
function OnlyFile(props: { name: string }){
    return (
        <>
            <div className='size-4 text-white'/>
            <FolderIcon className='size-4 text-yellow-500'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
function Collapsed(props: { name: string }){
    return (
        <>
            <ChevronRightIcon className='size-4 text-white'/>
            <FolderIcon className='size-4 text-yellow-500'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
function Expanding(props: { name: string }){
    return (
        <>
            <ChevronRightIcon className='size-4 text-white rotate-90'/>
            <FolderOpenIcon className='size-4 text-yellow-500'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
