import { createEntityAdapter, createSelector, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store";
import { closeProjectThunk, openProjectThunk } from "../thunks/folder-manager-thunks";

export declare namespace FolderManager {
    export type DirectoryState = DirectoryTree.Directory & {
        expanding?: boolean
    }
}
interface DirectoryEntityState extends EntityState<FolderManager.DirectoryState | DirectoryTree.File, string> {
    projectPath: string | null,
    selectedPath: string | null,
    focusedPath: string | null
}
const adapter = createEntityAdapter<FolderManager.DirectoryState | DirectoryTree.File, string>({
    selectId: (entry) => entry.path
});
const initialState: DirectoryEntityState = adapter.getInitialState({
    projectPath: null,
    selectedPath: null,
    focusedPath: null
});
const slice = createSlice({
    initialState,
    name: "folder-manager",
    reducers: {
        toggleExpandDirectory: (state, action: PayloadAction<{ path: string, force?: boolean }>) => {
            const { path, force } = action.payload;
            if(state.projectPath == null) return;
            const found = state.entities[path];
            if(!found || found.type === "File") return;
            if(found) found.expanding = force !== undefined ? force : !found.expanding;
        },
        chooseEntry: (state, action: PayloadAction<{ path: string }>) => {
            state.selectedPath = action.payload.path;
        },
        focusEntry: (state, action: PayloadAction<{ path: string }>) => {
            state.focusedPath = action.payload.path;
        },
        unfocusEntry: (state) => {
            state.focusedPath = null;
        },
        addEntry: (
            state,
            action: PayloadAction<{
                parentPath: string,
                entry: DirectoryTree.Directory | DirectoryTree.File
            }>
        ) => {
            const { parentPath, entry } = action.payload;
            if(state.entities[entry.path]) return;
            const parent = state.entities[parentPath];
            if(!parent || parent.type === "File") return;
            parent.children.push(entry.path);
            adapter.addOne(state, entry);
        },
        deleteEntry: (
            state,
            action: PayloadAction<{
                parentPath: string,
                entryPath: string
            }>
        ) => {
            const { parentPath, entryPath } = action.payload;
            const parent = state.entities[parentPath];
            if(!parent || parent.type === "File") return;
            const index = parent.children.findIndex(path => path === entryPath);
            if(index == -1) return;
            parent.children.splice(index, 1);
            adapter.removeOne(state, entryPath);
        }
    },
    extraReducers(builder){
        builder.addCase(openProjectThunk.fulfilled, (state, action) => {
            state.projectPath = action.payload.projectPath;
            adapter.addMany(state, action.payload.entries);
        });
        builder.addCase(closeProjectThunk.fulfilled, (state) => {
            state.projectPath = null;
            adapter.removeAll(state);
            state.selectedPath = null;
            state.focusedPath = null;
        });
    }
});
export const {
  selectById: selectEntryByPath,
  selectEntities: selectEntryRecord
} = adapter.getSelectors((state: RootState) => state.folderManager);
const selectChildren = createSelector(
    [
        selectEntryRecord,
        (_: RootState, children: string[]) => children
    ],
    (entities, children) => {
        return children.map(path => entities[path]);
    }
);
function selectSelectedEntry(state: RootState){
    const { selectedPath } = state.folderManager;
    if(selectedPath) return selectEntryByPath(state, selectedPath);
}
function selectFocusedEntry(state: RootState){
    const { focusedPath } = state.folderManager;
    if(focusedPath) return selectEntryByPath(state, focusedPath);
}
export const { toggleExpandDirectory, chooseEntry,
    focusEntry, unfocusEntry, addEntry, deleteEntry
} = slice.actions;
export { selectChildren, selectSelectedEntry, selectFocusedEntry }
export default slice.reducer;
