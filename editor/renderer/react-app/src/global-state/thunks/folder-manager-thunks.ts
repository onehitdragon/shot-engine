import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { reloadEntries } from "../slices/folder-manager-slice";
import { addLog, updateLoading } from "../slices/app-loading-slice";

let offBlurEvent: Function | null = null;
let offFocusEvent: Function | null = null;
let offWatchEvent: Function | null = null;
export const openProjectThunk = createAsyncThunk
<
    {
        projectPath: string,
        entries: (DirectoryTree.Directory | DirectoryTree.File)[]
    },
    { path: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/openProject",
    async ({ path }, { getState, dispatch, rejectWithValue }) => {
        try{
            dispatch(updateLoading({ loading: true }));
            dispatch(addLog({ log: `Opening project... ${path}` }));
            let projectPath = getState().folderManager.projectPath;
            if(projectPath) throw "having a project is opening";
            projectPath = path;

            dispatch(addLog({ log: `ensureMetaFile... ` }));
            await window.api.folder.ensureMetaFile(projectPath);
            
            dispatch(addLog({ log: `load...` }));
            const entries = await window.api.folder.load(projectPath);

            dispatch(addLog({ log: `processBlurFocusEvent...` }));
            await processBlurFocusEvent(path, dispatch);
            return {
                projectPath,
                entries
            };
        }
        catch(err){
            dispatch(closeProjectThunk());
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
        finally{
            dispatch(updateLoading({ loading: false }));
        }
    }
);
async function processBlurFocusEvent(projectPath: string, dispatch: AppDispatch){
    let isBlur = !(await window.api.win.isFocused());
    let isDirty = false;
    let running = false;
    const reload = async () => {
        if(running) return;
        running = true;
        try{
            dispatch(updateLoading({ loading: true }));
            dispatch(addLog({ log: `Reloading project... ${projectPath}` }));
            dispatch(addLog({ log: `ensureMetaFile... ` }));
            await window.api.folder.ensureMetaFile(projectPath);
            dispatch(addLog({ log: `load...` }));
            const entries = await window.api.folder.load(projectPath);
            dispatch(reloadEntries({ entries }));
        }
        catch(err){
            dispatch(closeProjectThunk());
            await window.api.showError(String(err));
        }
        finally{
            running = false;
            isDirty = false;
            dispatch(updateLoading({ loading: false }));
        }
    }
    offBlurEvent = window.api.win.onBlur(() => {
        isBlur = true;
    });
    offFocusEvent = window.api.win.onFocus(() => {
        isBlur = false;
        if(isDirty){
            reload();
        }
    });
    offWatchEvent = window.api.folder.onWatchEvent(() => {
        if(isBlur) isDirty = true;
    });
    await window.api.folder.watch(projectPath);
}
export const closeProjectThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/closeProject",
    async (_, { getState }) => {
        try{
            const projectPath = getState().folderManager.projectPath;
            if(!projectPath) throw "no project has been opened yet";
            await window.api.folder.unwatch(projectPath);
        }
        catch(err){
            await window.api.showError(String(err));
        }
        finally{
            offBlurEvent?.();
            offFocusEvent?.();
            offWatchEvent?.();
            offBlurEvent = null;
            offFocusEvent = null;
            offWatchEvent = null;
        }
    }
)
