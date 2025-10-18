import { ArrowPathIcon, FolderPlusIcon, DocumentPlusIcon, TrashIcon, FolderIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { deleteFocusedEntry, focusEntry, selectDirectory, selectFocusedEntry, toggleExpandDirectory, unfocusEntry, type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { useEffect } from "react";

type SelectedFolderProps = {
    directory: FolderManager.DirectoryState
}
export function SelectedFolder(props: SelectedFolderProps){
    const { directory } = props;
    const { children: entries } = directory;
    const dispatch = useAppDispatch();
    useEffect(() => {
        const handler = () => {
            dispatch(unfocusEntry());
        };
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, []);

    return (
        <div className='flex-4 bg-gray-500 flex flex-col overflow-hidden'>
            <ButtonBar selectedDirectory={directory}/>
            <div className='flex-1 p-1 flex flex-col overflow-auto
                scrollbar-thin'>
                {
                    entries.map(entry => <Entry key={entry.path} entry={entry} parentDirectory={directory}/>)
                }
            </div>
            <Footer />
        </div>
    );
}

type EntryProps = {
    entry: FolderManager.DirectoryState | DirectoryTree.File,
    parentDirectory: FolderManager.DirectoryState
}
function Entry(props: EntryProps){
    const { entry, parentDirectory } = props;
    const dispatch = useAppDispatch();
    const focused = useAppSelector(selectFocusedEntry);
    const isFoucused = focused && focused.path == entry.path;
    const click = () => {
        dispatch(focusEntry({ path: entry.path }));
    };
    const doubleClick = () => {
        if(entry.type == "Directory"){
            dispatch(selectDirectory({ path: entry.path }));
            dispatch(toggleExpandDirectory({ path: parentDirectory.path, force: true }));
            dispatch(unfocusEntry());
        }
    };

    return (
        <div className={`flex items-center ${!isFoucused ? "hover:opacity-70" : "bg-gray-600"} hover:cursor-pointer`}
            onClick={(e) => { click(); e.stopPropagation(); }}
            onDoubleClick={doubleClick}
        >
            {
                entry.type == "Directory" ?
                <DirectoryEntry key={entry.path} directory={entry}/> :
                <FileEntry key={entry.path} file={entry}/>
            }
        </div>
    );
}
type FileEntryProps = {
    file: DirectoryTree.File
}
function FileEntry(props: FileEntryProps){
    const { file } = props;

    return (
        <>
            <DocumentTextIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{file.name}</span>
        </>
    );
}
type DirectoryEntryProps = {
    directory: FolderManager.DirectoryState
}
function DirectoryEntry(props: DirectoryEntryProps){
    const { directory } = props;
    const { children: entries } = directory;

    return (
        <>
            {
                entries.length == 0 ?
                <Empty name={directory.name}/> :
                <NonEmpty name={directory.name}/>
            }
        </>
    );
}
function Empty(props: { name: string }){
    return (
        <>
            <FolderEmptyIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </>
    );
}
function NonEmpty(props: { name: string }){
    return (
        <>
            <FolderIcon className='size-4 text-white'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </>
    );
}
type ButtonBarProps = {
    selectedDirectory: FolderManager.DirectoryState
}
function ButtonBar(props: ButtonBarProps){
    const { selectedDirectory } = props;
    const focused = useAppSelector(selectFocusedEntry);
    const dispatch = useAppDispatch();
    const deleteHandler = async () => {
        if(!focused) return;
        const success = await window.api.file.delete(focused.path, true);
        if(success) dispatch(deleteFocusedEntry());
    }

    return (
        <div className='flex shadow-lg/10 shadow-black'>
            <ul className='flex-1 flex'>
                <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                    <FolderPlusIcon className='size-4 text-white'/>
                </button>
                <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                    <DocumentPlusIcon className='size-4 text-white'/>
                </button>
                {
                    focused
                    &&
                    <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
                        onClick={(e) => { deleteHandler(); e.stopPropagation() }}>
                        <TrashIcon className='size-4 text-red-500'/>
                    </button>
                }
            </ul>
            <ul className='flex-1 flex justify-end'>
                <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                    <ArrowPathIcon className='size-4 text-white'/>
                </button>
            </ul>
        </div>
    );
}
function Footer(){
    const focused = useAppSelector(selectFocusedEntry);
    const isFileFoused = focused && focused.type == "File";

    return (
        <div className="bg-gray-600 flex items-center px-2 py-1 h-7">
            <span className="text-white text-sm select-none truncate">
                {isFileFoused && focused.path}
            </span>
        </div>
    );
}
