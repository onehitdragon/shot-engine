import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { addEntry, deleteEntry, reloadEntries } from "../slices/folder-manager-slice";
import { addLog, updateLoading } from "../slices/app-loading-slice";
import { createAssetFolder, createAssetImage, type Assets } from "../../engine-zod";
import { pathIsImage } from "../../pages/main-page/helpers/folder-manager-helper/helper";
import { addAsset, deleteAsset, recreate } from "../slices/asset-manager-slice";

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
            const metaObjects = await window.api.folder.ensureMetaFile(projectPath);
            dispatch(recreate({ metaObjects }));
            
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
            const metaObjects = await window.api.folder.ensureMetaFile(projectPath);
            dispatch(recreate({ metaObjects }));
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
);
export const createFolderThunk = createAsyncThunk
<
    void,
    { parentPath: string, name: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/createFolder",
    async ({ parentPath, name }, { getState, dispatch }) => {
        try{
            const projectPath = getState().folderManager.projectPath;
            if(!projectPath) throw "no project has been opened yet";
            const path = await window.fsPath.join(parentPath, name);
            const created = await window.api.folder.create(path);
            const assetPath = await window.fsPath.join(projectPath, "Assets");
            if(path.startsWith(assetPath)){
                const asset = createAssetFolder();
                await window.api.file.save(
                    created.path + ".meta.json",
                    JSON.stringify(asset, null, 2)
                );
                dispatch(addAsset({
                    metaObject: {
                        path: created.path,
                        asset
                    }
                }));
            }
            dispatch(addEntry({ parentPath, entry: created }));
        }
        catch(err){
            dispatch(closeProjectThunk());
            await window.api.showError(String(err));
        }
    }
);
export const importFileThunk = createAsyncThunk
<
    void,
    { destFolder: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/importFile",
    async ({ destFolder }, { getState, dispatch }) => {
        try{
            const projectPath = getState().folderManager.projectPath;
            if(!projectPath) throw "no project has been opened yet";
            const assetPath = await window.fsPath.join(projectPath, "Assets");
            if(!destFolder.startsWith(assetPath)){
                await window.api.showError(String("importing requires inside the asset path"));
                return;
            }
            const importPath = await window.api.file.open();
            if(!importPath) return;
            let importedFile: DirectoryTree.File | null = null;
            let asset: Assets.Asset | null = null;
            if(importPath.endsWith(".fbx")){
                importedFile = await window.api.file.importModel(importPath, destFolder);
                // fix later
            }
            else if(pathIsImage(importPath)){
                const name = await window.fsPath.basename(importPath);
                const destPath = await window.fsPath.join(destFolder, name);
                importedFile = await window.api.file.copy(importPath, destPath);
                asset = createAssetImage();
                await window.api.file.save(
                    destPath + ".meta.json",
                    JSON.stringify(asset, null, 2)
                );
            }
            else{
                await window.api.showError(String(`file extension ${importPath} dont support`));
                return;
            }
            if(importedFile && asset){
                dispatch(addEntry({ parentPath: destFolder, entry: importedFile }));
                dispatch(addAsset({
                    metaObject: {
                        path: importedFile.path,
                        asset
                    }
                }));
            }
        }
        catch(err){
            dispatch(closeProjectThunk());
            await window.api.showError(String(err));
        }
    }
);
export const deleteEntryThunk = createAsyncThunk
<
    void,
    { parentPath: string, entryPath: string, recycle: boolean },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/deleteEntry",
    async ({ parentPath, entryPath, recycle }, { getState, dispatch }) => {
        try{
            const projectPath = getState().folderManager.projectPath;
            if(!projectPath) throw "no project has been opened yet";
            await window.api.file.delete(entryPath, recycle);
            const metaPath = entryPath + ".meta.json";
            const metaObject = JSON.parse(await window.api.file.getText(metaPath));
            await window.api.file.delete(metaPath, recycle);
            dispatch(deleteEntry({ parentPath, entryPath }));
            dispatch(deleteAsset({ guid: metaObject["guid"] }));
        }
        catch(err){
            dispatch(closeProjectThunk());
            await window.api.showError(String(err));
        }
    }
)
