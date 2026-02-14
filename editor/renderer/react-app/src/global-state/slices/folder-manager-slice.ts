import { createEntityAdapter, createSelector, createSlice, type EntityState, type PayloadAction, type WritableDraft } from "@reduxjs/toolkit"
import type { RootState } from "../store";
import { entryDeletedThunk, fileImportedThunk, folderCreatedThunk, projectClosedThunk, projectOpenedThunk } from "../thunks/folder-manager-thunks";
import { newSceneFileSaved } from "../thunks/scene-manager-thunks";

export namespace FolderManager {
    export type ProjectPaths = {
        project: string,
        asset: string,
        assetDefault: string,
        resource: string
    }
    export type DirectoryState = DirectoryTree.Directory & {
        expanding?: boolean
    }
}
interface DirectoryEntityState extends EntityState<FolderManager.DirectoryState | DirectoryTree.File, string> {
    projectPaths: FolderManager.ProjectPaths | null,
    selectedPath: string | null,
    focusedPath: string | null
}
const adapter = createEntityAdapter<FolderManager.DirectoryState | DirectoryTree.File, string>({
    selectId: (entry) => entry.path
});
const initialState: DirectoryEntityState = adapter.getInitialState({
    projectPaths: null,
    selectedPath: null,
    focusedPath: null
});
const slice = createSlice({
    initialState,
    name: "folder-manager",
    reducers: {
        toggleExpandDirectory: (state, action: PayloadAction<{ path: string, force?: boolean }>) => {
            const { path, force } = action.payload;
            if(state.projectPaths == null) return;
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
        }
    },
    extraReducers(builder){
        builder.addCase(projectOpenedThunk.fulfilled, (state, action) => {
            state.projectPaths = action.payload.projectPaths;
            adapter.addMany(state, action.payload.entries);
        });
        builder.addCase(projectClosedThunk.fulfilled, (state) => {
            state.projectPaths = null;
            adapter.removeAll(state);
            state.selectedPath = null;
            state.focusedPath = null;
        });
        builder.addCase(folderCreatedThunk.fulfilled, (state, action) => {
            const { parentPath } = action.meta.arg;
            const { dirCreated, metaCreated } = action.payload;
            addEntry(state, parentPath, dirCreated);
            addEntry(state, parentPath, metaCreated);
        });
        builder.addCase(fileImportedThunk.fulfilled, (state, action) => {
            const { destFolder } = action.meta.arg;
            const { fbxImport, imageImport } = action.payload;
            if(fbxImport){
                const { fbxDirCreated, fbxDirMetaCreated, meshFiles, prefab } = fbxImport;
                addEntry(state, destFolder, fbxDirCreated);
                addEntry(state, destFolder, fbxDirMetaCreated);
                for(const { meshCreated, metaCreated } of meshFiles){
                    addEntry(state, fbxDirCreated.path, meshCreated);
                    addEntry(state, fbxDirCreated.path, metaCreated);
                }
                addEntry(state, fbxDirCreated.path, prefab.prefabCreated);
                addEntry(state, fbxDirCreated.path, prefab.metaCreated);
            }
            if(imageImport){
                const { copyCreated, metaCreated } = imageImport;
                addEntry(state, destFolder, copyCreated);
                addEntry(state, destFolder, metaCreated);
            }
        });
        builder.addCase(entryDeletedThunk.fulfilled, (state, action) => {
            const { parentPath, entryPath } = action.meta.arg;
            const { paths, metaEntryPath, metaPaths } = action.payload;
            deleteEntry(state, { entryPath, parentPath, paths });
            deleteEntry(state, { entryPath: metaEntryPath, parentPath, paths: metaPaths });
        });
        builder.addCase(
            newSceneFileSaved,
            (state, action) => {
                const { savedDir, sceneSaved, metaSaved } = action.payload;
                addEntry(state, savedDir, sceneSaved);
                addEntry(state, savedDir, metaSaved);
            }
        );
    }
});
const addEntry = (
    state: WritableDraft<DirectoryEntityState>,
    parentPath: string,
    entry: DirectoryTree.Entry
) => {
    if(state.entities[entry.path]) return;
    const parent = state.entities[parentPath];
    if(!parent || parent.type === "File") return;
    parent.children.push(entry.path);
    adapter.addOne(state, entry);
}
const deleteEntry = (
    state: WritableDraft<DirectoryEntityState>,
    inputs: {
        entryPath: string,
        parentPath: string,
        paths: string[]
    }
) => {
    const { parentPath, entryPath, paths } = inputs;
    const parent = state.entities[parentPath];
    if(!parent || parent.type === "File") return;
    parent.children = parent.children.filter(child => child !== entryPath);
    adapter.removeMany(state, paths);
}
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
    focusEntry, unfocusEntry,
} = slice.actions;
export { selectChildren, selectSelectedEntry, selectFocusedEntry }
export default slice.reducer;
