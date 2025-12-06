import { FolderPlusIcon, DocumentPlusIcon, FolderIcon, DocumentTextIcon,
    ArrowDownOnSquareIcon
 } from "@heroicons/react/24/solid";
import { addEntry, deleteFocusedEntry, focusEntry, selectDirectory, selectFocusedEntry, toggleExpandDirectory, unfocusEntry, type FolderManager } from "../../../../global-state/slices/folder-manager-slice";
import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { useEffect, useRef, useState } from "react";

type SelectedFolderProps = {
    directory: FolderManager.DirectoryState
}
export function SelectedFolder(props: SelectedFolderProps){
    const { directory } = props;
    const { children: entries } = directory;
    const dispatch = useAppDispatch();
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: PointerEvent) => {
            const wrapper = ref.current;
            const target = e.target as HTMLElement | null;
            if(!wrapper || !target) return;
            if(target.closest("#inspector")) return;
            if(!wrapper.contains(target)){
                dispatch(unfocusEntry());
            }
        }
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, []);

    return (
        <div className='flex-4 bg-gray-500 flex flex-col overflow-hidden'>
            <ButtonBar selectedDirectory={directory}/>
            <div ref={ref} className='p-1 flex flex-col overflow-auto
                scrollbar-thin'>
                {
                    entries.map(entry => <Entry key={entry.path} entry={entry} parentDirectory={directory}/>)
                }
            </div>
            <div className="flex-1"></div>
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
            onClick={click}
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
    useEffect(() => {
        const handler = async (e: KeyboardEvent) => {
            if(!focused) return;
            if(!e.shiftKey && e.key == "Delete"){
                const success = await window.api.file.delete(focused.path, true);
                if(success){
                    dispatch(deleteFocusedEntry());
                    dispatch(unfocusEntry());
                }
            }
            if(e.shiftKey && e.key == "Delete"){
                const success = await window.api.file.delete(focused.path, false);
                if(success){
                    dispatch(deleteFocusedEntry());
                    dispatch(unfocusEntry());
                }
            }
        }
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [focused]);

    return (
        <div className='flex shadow-lg/10 shadow-black'>
            <ul className='flex-1 flex items-center'>
                <CreateFolderButton selectedDirectory={selectedDirectory}/>
                <CreateFileButton selectedDirectory={selectedDirectory}/>
                <ImportFileButton selectedDirectory={selectedDirectory}/>
            </ul>
            <ul className='flex-1 flex justify-end'>
                {/* <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                    <ArrowPathIcon className='size-4 text-white'/>
                </button> */}
            </ul>
        </div>
    );
}
function CreateFolderButton(props: { selectedDirectory: FolderManager.DirectoryState }){
    const { selectedDirectory } = props;
    const [enteringName, setEnteringName] = useState(false);
    const dispatch = useAppDispatch();
    const create = async (name: string) => {
        const created = await window.api.folder.create(selectedDirectory.path, name);
        if(created) dispatch(addEntry({ entry: created }))
    }
    const close = () => {
        setEnteringName(false);
    }

    return (
        !enteringName ?
        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
            onClick={() => { setEnteringName(true); }}>
            <FolderPlusIcon className='size-4 text-white'/>
        </button>
        :
        <EntryNameInput
            entries={selectedDirectory.children}
            create={create}
            close={close}
        />
    );
}
function CreateFileButton(props: { selectedDirectory: FolderManager.DirectoryState }){
    const { selectedDirectory } = props;
    const [enteringName, setEnteringName] = useState(false);
    const dispatch = useAppDispatch();
    const create = async (name: string) => {
        const created = await window.api.file.create(selectedDirectory.path, name);
        if(created) dispatch(addEntry({ entry: created }))
    }
    const close = () => {
        setEnteringName(false);
    }

    return (
        !enteringName ?
        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
            onClick={() => { setEnteringName(true); }}>
            <DocumentPlusIcon className='size-4 text-white'/>
        </button>
        :
        <EntryNameInput
            entries={selectedDirectory.children}
            create={create}
            close={close}
        />
    );
}
function ImportFileButton(props: { selectedDirectory: FolderManager.DirectoryState }){
    const { selectedDirectory } = props;
    const dispatch = useAppDispatch();
    const open = async () => {
        const importPath = await window.api.file.open();
        if(!importPath) return;
        const imported = await window.api.file.import(importPath, selectedDirectory.path);
        if(!imported) return;
        dispatch(addEntry({ entry: imported }));
    }
    return (
        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
            onClick={open}>
            <ArrowDownOnSquareIcon className='size-4 text-white'/>
        </button>
    );
}
type EntryNameInputProps = {
    entries: (DirectoryTree.Directory | DirectoryTree.File)[],
    create: (name: string) => void,
    close: () => void
}
function EntryNameInput(props: EntryNameInputProps){
    const { entries, close, create } = props;
    const [name, setName] = useState("");
    const isValid = () => {
        const nameTrim = name.trim();
        if(nameTrim == "") return false;
        return !entries.some(entry => entry.name == nameTrim);
    }
    const keyDown = async (value: string) => {
        if(/^[^/\\:*?"<>|]$/.test(value)){
            setName(name + value);
        }
        else if(value == "Backspace") setName(name.slice(0, name.length - 1));
        else if(value == "Enter" && isValid()){
            create(name);
            close();
        }
    }
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: PointerEvent) => {
            const wrapper = ref.current;
            const target = e.target as HTMLElement | null;
            if(!wrapper || !target) return;
            if(!wrapper.contains(target)){
                close();
            }
        };
        setTimeout(() => window.addEventListener("click", handler), 0);
        return () => window.removeEventListener("click", handler);
    }, []);

    return (
        <div ref={ref} className="flex">
            <input className={`ml-2 outline-none h-5 text-sm text-white border
                ${isValid() ? "border-blue-500" : "border-red-500"}`}
                autoFocus spellCheck={false} value={name}
                onKeyDown={(e) => { keyDown(e.key); }}
                onChange={() => {}}
            />
        </div>
    );
}
function Footer(){
    const focused = useAppSelector(selectFocusedEntry);
    const isFileFoused = focused && focused.type == "File";

    return (
        <div className="bg-gray-600 flex items-center px-2 py-1 min-h-7">
            <span className="text-white text-sm select-none truncate">
                {isFileFoused && focused.path}
            </span>
        </div>
    );
}
