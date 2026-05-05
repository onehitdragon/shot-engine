import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { type FolderManager } from "../slices/folder-manager-slice";
import { addLog } from "../slices/app-loading-slice";
import { loop } from "../../pages/main-page/helpers/folder-manager-helper/helper";
import { createEmptyPrefab } from "../../pages/main-page/helpers/scene-manager-helper/SceneNodeHelper";
import { showInspector } from "../slices/inspector-slice";
// import { sceneClosedThunk } from "./scene-manager-thunks";

export const projectOpenedThunk = createAsyncThunk
<
    {
        projectPaths: FolderManager.ProjectPaths
        entries: (DirectoryTree.Directory | DirectoryTree.File)[]
    },
    { path: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "project/projectOpened",
    async ({ path }, { getState, dispatch, rejectWithValue }) => {
        try{
            const projectFilePath = await window.fsPath.join(path, ".project");
            const projectFilePathExist = await window.api.file.exist(projectFilePath);
            if(!projectFilePathExist){
                throw `${path} is not project folder`;
            }

            let projectPaths = getState().folderManager.projectPaths;
            if(projectPaths) throw "having a project is opening";
            projectPaths = {
                project: path,
                asset: await window.fsPath.join(path, "Assets"),
                assetDefault: await window.fsPath.join(path, "Assets", ".default"),
                resource: await window.fsPath.join(path, "Engine", "Resource"),
                assetDBFile: await window.fsPath.join(path, "Engine", "sqlite3.db")
            }
            await window.api.folder.create(projectPaths.asset);
            await window.api.folder.create(projectPaths.assetDefault);
            await window.api.folder.create(projectPaths.resource);

            dispatch(addLog({ log: `Loading assets... ${path}` }));
            await window.api.assetManager.config({
                assetDir: projectPaths.asset,
                assetDefaultDir: projectPaths.assetDefault,
                assetGenerateDir: projectPaths.resource,
                dbFilePath: projectPaths.assetDBFile
            });
            await window.api.assetManager.rescan();
            const entries = await window.api.folder.load(projectPaths.project);

            return {
                projectPaths,
                entries
            };
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const projectClosedThunk = createAsyncThunk
<
    void,
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "project/projectClosed",
    async (_, { getState, dispatch }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";
            // await dispatch(sceneClosedThunk());
            await window.api.assetManager.close();
        }
        catch(err){
            await window.api.showError(String(err));
        }
    }
);
export const projectRescanThunk = createAsyncThunk
<
    {
        entries: DirectoryTree.Entry[]
    },
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "project/projectRescan",
    async (_, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";

            await window.api.assetManager.rescan();
            const entries = await window.api.folder.load(projectPaths.project);

            return {
                entries
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const folderCreatedThunk = createAsyncThunk
<
    {
        dirCreated: DirectoryTree.Directory
    },
    { parentPath: string, name: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/folderCreated",
    async ({ parentPath, name }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";

            if(parentPath.startsWith(projectPaths.assetDefault)) throw "Dont create inside default";
            if(!parentPath.startsWith(projectPaths.asset)) throw "Dont create outside asset folder";

            const path = await window.fsPath.join(parentPath, name);
            const dirCreated = await window.api.folder.create(path);

            return {
                dirCreated
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const fileImportedThunk = createAsyncThunk
<
    {
        copyCreated: DirectoryTree.File
    },
    { destFolder: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/importFile",
    async ({ destFolder }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";
            if(destFolder.startsWith(projectPaths.assetDefault)) throw "Dont import to default folder";
            if(!destFolder.startsWith(projectPaths.asset)) throw "Dont import outside asset folder";

            const importPath = await window.api.file.open();
            if(!importPath) throw "need an import path";

            const importName = await window.fsPath.basename(importPath);
            const destPath = await window.fsPath.join(destFolder, importName);
            await window.api.file.copy(importPath, destPath);
            const copyCreated: DirectoryTree.File = {
                type: "File",
                name: importName,
                path: destPath
            }

            await window.api.assetManager.rescan();

            return {
                copyCreated
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const entryDeletedThunk = createAsyncThunk
<
    {
        paths: string[]
    },
    { parentPath: string, entryPath: string, recycle: boolean },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/entryDeleted",
    async ({ entryPath, recycle }, { getState, dispatch, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";

            if(entryPath.startsWith(projectPaths.assetDefault)) throw "Dont delete default file";
            // const { path: scenePath } = getState().sceneManager;
            // if(entryPath === scenePath) throw "Cant delete opening scene";
            
            const paths: string[] = [];
            loop(entryPath, getState().folderManager.entities, (entry) => {
                paths.push(entry.path);
            });

            for(const path of paths){
                await window.api.file.delete(path, recycle);
            }

            await window.api.assetManager.rescan();

            dispatch(showInspector({ inspector: null }));

            return {
                paths
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const prefabFileCreatedThunk = createAsyncThunk
<
    {
        fileCreated: DirectoryTree.File
    },
    { parentPath: string, name: string },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "folder-manager/prefabFileCreated",
    async ({ parentPath, name }, { getState, rejectWithValue }) => {
        try{
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";
            
            if(parentPath.startsWith(projectPaths.assetDefault)) throw "Dont create inside default";
            if(!parentPath.startsWith(projectPaths.asset)) throw "Dont create outside asset folder";

            const path = await window.fsPath.join(parentPath, name);
            await window.api.assetManager.savePrefabAssetBinary(
                {
                    root: createEmptyPrefab()
                },
                path
            );

            await window.api.assetManager.rescan();

            return {
                fileCreated: {
                    type: "File",
                    name,
                    path
                }
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
