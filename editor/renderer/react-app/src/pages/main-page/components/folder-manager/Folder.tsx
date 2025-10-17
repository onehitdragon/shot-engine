import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from "@heroicons/react/24/solid";
import { useState } from 'react';

type FolderProps = {
    directory: DirectoryTree.Directory
}
export function Folder(props: FolderProps){
    const { directory } = props;
    const { children: entries } = directory;
    const isEmpty = entries.length == 0;
    const isOnlyFile = !isEmpty && entries.every(entry => entry.type == "File");
    const [collapsed, setSollapsed] = useState(true);

    return (
        <div className='flex-col'>
            {
                isEmpty ? (
                    <EmptyEntry
                        directory={directory}
                        click={() => {}}
                    />
                )
                : isOnlyFile ? (
                    <OnlyFileEntry
                        directory={directory}
                        click={() => {}}
                    />
                )
                : (
                    <OpenableEntry 
                        directory={directory}
                        click={() => { setSollapsed(!collapsed) }}
                        collapsed={collapsed}
                    />
                ) 
            }
            {
                !collapsed &&
                <ul className='ml-4 flex flex-col'>
                    {
                        entries.map(entry => {
                            if(entry.type == 'Directory'){
                                return <Folder key={entry.name} directory={entry}/>
                            }
                        })
                    }
                </ul>
            }
        </div>
    );
}

type EntryProps = {
    directory: DirectoryTree.Directory,
    click: () => void
}
function EmptyEntry(props: EntryProps){
    const { directory, click } = props;

    return (
        <div className='flex items-center hover:opacity-50 hover:cursor-pointer transition duration-200'
            onClick={click}>
            <Empty name={directory.name}/>
        </div>
    );
}
function OnlyFileEntry(props: EntryProps){
    const { directory, click } = props;

    return (
        <div className='flex items-center hover:opacity-50 hover:cursor-pointer transition duration-200'
            onClick={click}>
            <OnlyFile name={directory.name}/>
        </div>
    );
}
type OpenableEntryProps = EntryProps & {
    collapsed: boolean
}
function OpenableEntry(props: OpenableEntryProps){
    const { directory, click, collapsed } = props;

    return (
        <div className='flex items-center hover:opacity-50 hover:cursor-pointer transition duration-200'
            onClick={click}>
            {
                collapsed ? 
                <Collapsed name={directory.name}/> :
                <Expanding name={directory.name}/>
            }
        </div>
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
            <ChevronRightIcon className='size-4 text-white animate-rotateOnce'/>
            <FolderOpenIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </> 
    );
}
