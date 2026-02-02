import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from "@heroicons/react/24/solid";
import { chooseEntry, selectEntryByPath, selectSelectedEntry, toggleExpandDirectory, type FolderManager } from '../../../../global-state/slices/folder-manager-slice';
import { useAppDispatch, useAppSelector } from '../../../../global-state/hooks';

type FolderProps = {
    path: string,
    level?: number
}
export function Folder(props: FolderProps){
    const { path, level = 0 } = props;
    const directory = useAppSelector(state => selectEntryByPath(state, path));
    if(directory.type !== "Directory") throw `${path} is not directory`;
    const { children: entries } = directory;
    const isEmpty = entries.length == 0;
    const isOnlyFile = !isEmpty && entries.every(entry => entry.type == "File");
    const dispatch = useAppDispatch();
    const selectedDirectory = useAppSelector(selectSelectedEntry);
    const isSelected = selectedDirectory && selectedDirectory.path == directory.path;
    const click = () => {
        if(!isOnlyFile) dispatch(toggleExpandDirectory({ path: directory.path }));
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
                        entries.map(entry => {
                            if(entry.type == 'Directory'){
                                return <Folder key={entry.path} path={entry.path} level={level + 1}/>
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
            <FolderEmptyIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
function OnlyFile(props: { name: string }){
    return (
        <>
            <div className='size-4 text-white'/>
            <FolderIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
function Collapsed(props: { name: string }){
    return (
        <>
            <ChevronRightIcon className='size-4 text-white'/>
            <FolderIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
function Expanding(props: { name: string }){
    return (
        <>
            <ChevronRightIcon className='size-4 text-white rotate-90'/>
            <FolderOpenIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
