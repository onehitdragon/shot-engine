import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export declare namespace FolderManager {
    export type DirectoryState = DirectoryTree.Directory & {
        expanding?: boolean,
        children: (DirectoryState | DirectoryTree.File)[]
    }
}
type State = {
    directory: FolderManager.DirectoryState | null,
    selectedPath: string | null,
    focusedPath: string | null
};
const initialState: State = {
    directory: null,
    selectedPath: null,
    focusedPath: null
}
const slice = createSlice({
    initialState,
    name: "folder-manager",
    reducers: {
        updateDirectory: (state, action: PayloadAction<{ directory: FolderManager.DirectoryState }>) => {
            state.directory = action.payload.directory;
        },
        toggleExpandDirectory: (state, action: PayloadAction<{ path: string, force?: boolean }>) => {
            const { path, force } = action.payload;
            if(state.directory == null) return;
            const found = findDirectory(state.directory, path);
            if(found) found.expanding = force !== undefined ? force : !found.expanding;
        },
        selectDirectory: (state, action: PayloadAction<{ path: string }>) => {
            state.selectedPath = action.payload.path;
        },
        focusEntry: (state, action: PayloadAction<{ path: string }>) => {
            state.focusedPath = action.payload.path;
        },
        unfocusEntry: (state) => {
            if(state.focusedPath) state.focusedPath = null;
        },
        deleteFocusedEntry(state){
            const { directory, selectedPath, focusedPath } = state;
            if(directory == null) return;
            if(selectedPath == null) return;
            if(focusedPath == null) return;
            const selectedFolder = findDirectory(directory, selectedPath);
            if(selectedFolder == null) return;
            const index = selectedFolder.children.findIndex((entry) => entry.path == focusedPath);
            if(index == -1) return;
            selectedFolder.children.splice(index, 1);
        },
        addEntry(state, action: PayloadAction<{ entry: DirectoryTree.Directory | DirectoryTree.File }>){
            const { directory, selectedPath } = state;
            if(directory == null) return;
            if(selectedPath == null) return;
            const selectedFolder = findDirectory(directory, selectedPath);
            if(selectedFolder == null) return;
            selectedFolder.children.push(action.payload.entry);
        }
    }
});
function findDirectory(directory: FolderManager.DirectoryState, path: string): FolderManager.DirectoryState | null{
    if(directory.path == path) return directory;
    for(const entry of directory.children){
        if(entry.type == "Directory"){
            const found = findDirectory(entry, path);
            if(found) return found;
        }
    }
    return null;
}
function findEntry(entry: FolderManager.DirectoryState | DirectoryTree.File, path: string): FolderManager.DirectoryState | DirectoryTree.File | null{
    if(entry.path == path) return entry;
    if(entry.type == "File") return null;
    const directory = entry;
    for(const entry of directory.children){
        const found = findEntry(entry, path);
        if(found) return found;
    }
    return null;
}
function selectSelectedFolder(state: RootState){
    const { directory, selectedPath } = state.folderManager;
    if(!directory || !selectedPath) return null;
    return findDirectory(directory, selectedPath);
}
function selectFocusedEntry(state: RootState){
    const { directory, focusedPath } = state.folderManager;
    if(!directory || !focusedPath) return null;
    return findEntry(directory, focusedPath);
}
export const { updateDirectory, toggleExpandDirectory, selectDirectory,
    focusEntry, unfocusEntry, deleteFocusedEntry, addEntry
} = slice.actions;
export { selectSelectedFolder, selectFocusedEntry }
export default slice.reducer;
