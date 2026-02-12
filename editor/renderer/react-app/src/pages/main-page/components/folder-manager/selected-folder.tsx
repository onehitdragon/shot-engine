import { FolderPlusIcon, FolderIcon, DocumentTextIcon,
    ArrowDownOnSquareIcon, PhotoIcon,
    Square3Stack3DIcon,
    GlobeAltIcon,
    CubeTransparentIcon
 } from "@heroicons/react/24/solid";
import { chooseEntry, selectFocusedEntry, toggleExpandDirectory, unfocusEntry, focusEntry, type FolderManager, selectEntryByPath, selectSelectedEntry } from "../../../../global-state/slices/folder-manager-slice";
import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { useEffect, useRef, useState } from "react";
import { showDialog } from "../../../../global-state/slices/app-confirm-dialog-slice";
import { fileIsImage } from "../../helpers/folder-manager-helper/helper";
import { createFolderThunk, deleteEntryThunk, importFileThunk } from "../../../../global-state/thunks/folder-manager-thunks";
import { inspectAssetThunk } from "../../../../global-state/thunks/inspector-thunks";

export function SelectedFolder(){
    const selectedEntry = useAppSelector(state => selectSelectedEntry(state));
    const dispatch = useAppDispatch();
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const wrapper = ref.current;
            const target = e.target as HTMLElement | null;
            if(!wrapper || !target) return;
            if(target.closest("#inspector")) return;
            if(!wrapper.contains(target)){
                dispatch(unfocusEntry());
            }
        }
        window.addEventListener("mousedown", handler);
        return () => window.removeEventListener("mousedown", handler);
    }, []);

    return (
        !selectedEntry || selectedEntry.type !== "Directory" ?
        <div className='flex-4 bg-gray-500 flex flex-col'></div> :
        <div className='flex-4 bg-gray-500 flex flex-col overflow-hidden'>
            <ButtonBar selectedDirectory={selectedEntry}/>
            <div ref={ref} className='p-1 flex flex-col overflow-auto
                scrollbar-thin'>
                {
                    selectedEntry.children.map(
                        path => <Entry key={path}
                            entryPath={path}
                            parentDirectory={selectedEntry}
                        />
                    )
                }
            </div>
            <div className="flex-1"></div>
            <Footer />
        </div>
    );
}

type EntryProps = {
    entryPath: string,
    parentDirectory: FolderManager.DirectoryState
}
function Entry(props: EntryProps){
    const { entryPath, parentDirectory } = props;
    const entry = useAppSelector(state => selectEntryByPath(state, entryPath));
    const dispatch = useAppDispatch();
    const focused = useAppSelector(selectFocusedEntry);
    const isFoucused = focused && focused.path == entry.path;
    const click = () => {
        dispatch(focusEntry(entry));
        dispatch(inspectAssetThunk(entry));
    };
    const doubleClick = () => {
        if(entry.type == "Directory"){
            dispatch(chooseEntry({ path: entry.path }));
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
    const isMeta = file.path.endsWith(".meta.json");
    const isScene = file.path.endsWith(".scene.json");
    const isMesh = file.path.endsWith(".mesh.json");
    const isPrefab = file.path.endsWith(".prefab.json");
    const iconGenerator = () => {
        if(isScene){
            return <Square3Stack3DIcon className='size-4 text-white'/>
        }
        else if(isMesh){
            return <GlobeAltIcon className='size-4 text-green-500'/>
        }
        else if(isPrefab){
            return <CubeTransparentIcon className='size-4 text-red-500'/>
        }
        else if(fileIsImage(file)){
            return <PhotoIcon className='size-4 text-white'/>
        }
        else{
            return <DocumentTextIcon className='size-4 text-white'/>
        }
    }

    return (
        <>
            {iconGenerator()}
            <span className={`text-sm ml-2 text-white ${isMeta && "opacity-40"} select-none`}>
                {file.name}
            </span>
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
            <FolderEmptyIcon className='size-4 text-yellow-500'/>
            <span className='text-sm ml-2 text-white select-none'>{props.name}</span>
        </>
    );
}
function NonEmpty(props: { name: string }){
    return (
        <>
            <FolderIcon className='size-4 text-yellow-500'/>
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
                dispatch(deleteEntryThunk({
                    parentPath: selectedDirectory.path,
                    entryPath: focused.path,
                    recycle: true
                }));
            }
            if(e.shiftKey && e.key == "Delete"){
                dispatch(showDialog({
                    content: "Permanent deleting?",
                    yesCallback: () => {
                        dispatch(deleteEntryThunk({
                            parentPath: selectedDirectory.path,
                            entryPath: focused.path,
                            recycle: false
                        }));
                    }
                }))
            }
        }
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [focused]);

    return (
        <div className='flex shadow-lg/10 shadow-black'>
            <ul className='flex-1 flex items-center'>
                <CreateFolderButton selectedDirectory={selectedDirectory}/>
                {/* <CreateFileButton selectedDirectory={selectedDirectory}/> */}
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
        dispatch(createFolderThunk({ parentPath: selectedDirectory.path, name }));
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
            children={selectedDirectory.children}
            create={create}
            close={close}
        />
    );
}
// function CreateFileButton(props: { selectedDirectory: FolderManager.DirectoryState }){
//     const { selectedDirectory } = props;
//     const [enteringName, setEnteringName] = useState(false);
//     const dispatch = useAppDispatch();
//     const create = async (name: string) => {
//         const createFilePath = await window.fsPath.join(selectedDirectory.path, name);
//         const created = await window.api.file.create(createFilePath, "");
//         dispatch(addEntry({ parentPath: selectedDirectory.path, entry: created }));
//     }
//     const close = () => {
//         setEnteringName(false);
//     }

//     return (
//         !enteringName ?
//         <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
//             onClick={() => { setEnteringName(true); }}>
//             <DocumentPlusIcon className='size-4 text-white'/>
//         </button>
//         :
//         <EntryNameInput
//             entries={selectedDirectory.children}
//             create={create}
//             close={close}
//         />
//     );
// }
function ImportFileButton(props: { selectedDirectory: FolderManager.DirectoryState }){
    const { selectedDirectory } = props;
    const dispatch = useAppDispatch();
    const open = () => {
        dispatch(importFileThunk({ destFolder: selectedDirectory.path }));
    }
    return (
        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
            onClick={open}>
            <ArrowDownOnSquareIcon className='size-4 text-white'/>
        </button>
    );
}
type EntryNameInputProps = {
    children: string[],
    create: (name: string) => void,
    close: () => void
}
function EntryNameInput(props: EntryNameInputProps){
    const { children, close, create } = props;
    const [name, setName] = useState("");
    const isValid = () => {
        const nameTrim = name.trim();
        if(nameTrim == "") return false;
        return !children.some(child => child.endsWith(nameTrim));
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
