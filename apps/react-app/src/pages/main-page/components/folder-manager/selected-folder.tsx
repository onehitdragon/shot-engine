import { FolderPlusIcon, FolderIcon, DocumentTextIcon,
    ArrowDownOnSquareIcon, PhotoIcon,
    GlobeAltIcon,
    TruckIcon, XCircleIcon,
    ArrowTurnDownRightIcon, PuzzlePieceIcon
 } from "@heroicons/react/24/solid";
import { chooseEntry, selectFocusedEntry, toggleExpandDirectory, unfocusEntry, focusEntry, type FolderManager, selectEntryByPath, selectSelectedEntry } from "../../../../global-state/slices/folder-manager-slice";
import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { useEffect, useRef, useState } from "react";
import { showDialog } from "../../../../global-state/slices/app-confirm-dialog-slice";
import { folderCreatedThunk, entryDeletedThunk, fileImportedThunk, prefabFileCreatedThunk } from "../../../../global-state/thunks/folder-manager-thunks";
import { inspectAssetThunk } from "../../../../global-state/thunks/inspector-thunks";
import type { AssetManager, AssetType } from "@shot-engine/types";
import { getBaseName } from "../../helpers/utils/utils";

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
    };
    const doubleClick = () => {
        if(entry.type == "Directory"){
            dispatch(chooseEntry({ path: entry.path }));
            dispatch(toggleExpandDirectory({ path: parentDirectory.path, force: true }));
            dispatch(unfocusEntry());
        }
    };

    return (
        <div className={`flex items-center hover:cursor-pointer`}
            onClick={click}
            onDoubleClick={doubleClick}
        >
            {
                entry.type == "Directory" ?
                <DirectoryEntry key={entry.path} directory={entry} isFoucused={isFoucused}/> :
                <FileEntry key={entry.path} file={entry} isFoucused={isFoucused}
                    onClick={(assetInfo) => {
                        dispatch(inspectAssetThunk({ assetInfo }));
                    }}
                />
            }
        </div>
    );
}
type FileEntryProps = {
    file: DirectoryTree.File,
    isFoucused?: boolean,
    onClick: (assetInfo: AssetManager.AssetInfo) => void
}
function FileEntry(props: FileEntryProps){
    const { file, isFoucused } = props;
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const [expand, setExpand] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfos(file.path);
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [isFoucused]);

    function iconFromType(type: AssetType){
        if(type === "mesh"){
            return <GlobeAltIcon className='size-4 text-green-500'/>
        }
        else if(type === "prefab"){
            return <PuzzlePieceIcon className='size-4 text-cyan-500'/>
        }
        else if(type === "image"){
            return <PhotoIcon className='size-4 text-white'/>
        }
        else{
            return <DocumentTextIcon className='size-4 text-white'/>
        }
    }
    const iconGenerator = () => {
        if(assetInfos.length === 0){
            return <XCircleIcon className='size-4 text-red-400'/>
        }
        if(assetInfos.length === 1){
            return iconFromType(assetInfos[0].type);
        }
        if(assetInfos.length > 1){
            return <TruckIcon className='size-4 text-green-500'/> 
        }
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className={`flex ${!isFoucused ? "hover:opacity-70" : "bg-gray-600"}`}
                onClick={() => {
                    setExpand(!expand);
                    if(assetInfos.length === 1) props.onClick(assetInfos[0]);
                }}>
                {iconGenerator()}
                <span className="text-sm ml-2 text-white select-none">
                    {file.name}
                </span>
            </div>
            {
                assetInfos.length > 1 && expand &&
                <div className="flex flex-col ml-2">
                    {
                        assetInfos.map((assetInfo) => {
                            return <div
                                key={assetInfo.uuid}
                                className={`flex hover:opacity-70`}
                                onClick={() => {
                                    props.onClick(assetInfo);
                                }}
                            >
                                <ArrowTurnDownRightIcon className='size-4 text-white'/>
                                {iconFromType(assetInfo.type)}
                                <span className="text-sm ml-2 text-white select-none">
                                    {assetInfo.name}
                                </span>
                            </div>
                        })
                    }
                </div>
            }
        </div>
    );
}
type DirectoryEntryProps = {
    directory: FolderManager.DirectoryState,
    isFoucused?: boolean,
}
function DirectoryEntry(props: DirectoryEntryProps){
    const { directory, isFoucused } = props;
    const { children: entries } = directory;

    return (
        <div className={`flex flex-1 ${!isFoucused ? "hover:opacity-70" : "bg-gray-600"}`}>
            {
                entries.length == 0 ?
                <Empty name={directory.name}/> :
                <NonEmpty name={directory.name}/>
            }
        </div>
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
                dispatch(entryDeletedThunk({
                    parentPath: selectedDirectory.path,
                    entryPath: focused.path,
                    recycle: true
                }));
            }
            if(e.shiftKey && e.key == "Delete"){
                dispatch(showDialog({
                    content: "Permanent deleting?",
                    yesCallback: () => {
                        dispatch(entryDeletedThunk({
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
            <ul className='flex-1 flex justify-end items-center'>
                <CreatePrefabButton selectedDirectory={selectedDirectory}/>
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
        dispatch(folderCreatedThunk({ parentPath: selectedDirectory.path, name }));
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
            children={selectedDirectory.children.map(e => getBaseName(e))}
            create={create}
            close={close}
        />
    );
}
function CreatePrefabButton(props: { selectedDirectory: FolderManager.DirectoryState }){
    const { selectedDirectory } = props;
    const [enteringName, setEnteringName] = useState(false);
    const dispatch = useAppDispatch();
    const create = async (name: string) => {
        dispatch(prefabFileCreatedThunk({ parentPath: selectedDirectory.path, name }));
    }
    const close = () => {
        setEnteringName(false);
    }

    return (
        !enteringName ?
        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity flex items-center'
            onClick={() => { setEnteringName(true); }}>
            <PuzzlePieceIcon className='size-4 text-cyan-500'/>
            <span className='text-xs text-cyan-500 select-none'>+</span>
        </button>
        :
        <EntryNameInput
            extension=".prefab"
            children={selectedDirectory.children.map(e => getBaseName(e))}
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
        dispatch(fileImportedThunk({ destFolder: selectedDirectory.path }));
    }
    return (
        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'
            onClick={open}>
            <ArrowDownOnSquareIcon className='size-4 text-white'/>
        </button>
    );
}
type EntryNameInputProps = {
    extension?: string,
    children: string[],
    create: (name: string) => void,
    close: () => void
}
function EntryNameInput(props: EntryNameInputProps){
    const { extension, children, close, create } = props;
    const [name, setName] = useState("");
    const isValid = () => {
        const nameTrim = name.trim() + (extension ?? "");
        if(nameTrim == "") return false;
        return !children.some(child => child === nameTrim);
    }
    const keyDown = async (value: string) => {
        if(/^[^/\\:*?"<>|]$/.test(value)){
            setName(name + value);
        }
        else if(value == "Backspace") setName(name.slice(0, name.length - 1));
        else if(value == "Enter" && isValid()){
            create(name + (extension ?? ""));
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
