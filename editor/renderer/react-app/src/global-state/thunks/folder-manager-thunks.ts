import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { addEntry, deleteEntry } from "../slices/folder-manager-slice";
import { addLog, updateLoading } from "../slices/app-loading-slice";
import { createAssetFolder, createAssetImage, createAssetMesh, createAssetPrefab, type Assets } from "../../engine-zod";
import { pathIsImage } from "../../pages/main-page/helpers/folder-manager-helper/helper";
import { addAsset, deleteAsset, recreate } from "../slices/asset-manager-slice";
import { createAssimpPrefab } from "../../pages/main-page/helpers/scene-manager-helper/SceneNodeHelper";

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
            
            const assetPath = await window.fsPath.join(projectPath, "Assets");
            await window.api.folder.create(assetPath);
            const libPath = await window.fsPath.join(projectPath, "Library");
            await window.api.folder.create(libPath);
            const scriptPath = await window.fsPath.join(assetPath, "Scripts");
            await window.api.folder.create(scriptPath);

            const entries = await window.api.folder.load(assetPath);

            dispatch(addLog({ log: `Loading assets... ${path}` }));
            const metaEntries = entries.filter(entry => entry.name.endsWith(".meta.json"));
            const metaObjects: Assets.MetaObject[] = [];
            for(const { path } of metaEntries){
                const json = await window.api.file.getText(path);
                const jsonObject = JSON.parse(json) as Assets.Asset;
                metaObjects.push({ path, asset: jsonObject });
            }
            dispatch(recreate({ metaObjects }));

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
    async (_, { getState, dispatch }) => {
        try{
            const projectPath = getState().folderManager.projectPath;
            if(!projectPath) throw "no project has been opened yet";
            dispatch(recreate({ metaObjects: [] }));
        }
        catch(err){
            await window.api.showError(String(err));
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
                const metaName = name + ".meta.json";
                const metaPath = path + ".meta.json";
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaCreated: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                }
                dispatch(addEntry({ parentPath, entry: metaCreated }));
                dispatch(addAsset({ metaObject: { path, asset } }));
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
            const importName = await window.fsPath.basename(importPath);

            if(importPath.endsWith(".fbx")){
                const { data: assimp } = await window.api.file.assimpImporter(importPath);

                const meshAssets: Assets.AssetMesh[] = [];
                for(const assimpMesh of assimp.meshes){
                    const mesh: MeshFormat.Mesh = {
                        vertices: assimpMesh.vertices,
                        vertexIndices: assimpMesh.faces.flat(),
                        normals: assimpMesh.normals
                    }
                    const meshName = `[${importName}]${assimpMesh.name}.mesh.json`;
                    const meshPath = await window.fsPath.join(destFolder, meshName);
                    await window.api.file.save(meshPath, JSON.stringify(mesh, null, 2));
                    const meshCreated: DirectoryTree.File = {
                        type: "File",
                        name: meshName,
                        path: meshPath
                    };
                    dispatch(addEntry({ parentPath: destFolder, entry: meshCreated }));

                    const asset = createAssetMesh();
                    const metaName = meshName + ".meta.json";
                    const metaPath = meshPath + ".meta.json";
                    await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                    const metaCreated: DirectoryTree.File = {
                        type: "File",
                        name: metaName,
                        path: metaPath
                    };
                    dispatch(addEntry({ parentPath: destFolder, entry: metaCreated }));
                    dispatch(addAsset({ metaObject: { path: meshPath, asset } }));
                    meshAssets.push(asset);
                }

                const prefab = createAssimpPrefab(assimp.rootnode, meshAssets);
                const prefabName = `[${importName}]${assimp.rootnode.name}.prefab.json`;
                const prefabPath = await window.fsPath.join(destFolder, prefabName);
                await window.api.file.save(prefabPath, JSON.stringify(prefab, null, 2));
                const prefabCreated: DirectoryTree.File = {
                    type: "File",
                    name: prefabName,
                    path: prefabPath
                };
                dispatch(addEntry({ parentPath: destFolder, entry: prefabCreated }));

                const asset = createAssetPrefab();
                const metaName = prefabName + ".meta.json";
                const metaPath = prefabPath + ".meta.json";
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaCreated: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                };
                dispatch(addEntry({ parentPath: destFolder, entry: metaCreated }));
                dispatch(addAsset({ metaObject: { path: prefabPath, asset } }));
            }
            else if(pathIsImage(importPath)){
                const destPath = await window.fsPath.join(destFolder, importName);
                await window.api.file.copy(importPath, destPath);
                const copyFile: DirectoryTree.File = {
                    type: "File",
                    name: importName,
                    path: destPath
                }
                dispatch(addEntry({ parentPath: destFolder, entry: copyFile }));
                
                const asset = createAssetImage();
                const metaName = importName + ".meta.json";
                const metaPath = destPath + ".meta.json";
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaCreated: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                }
                dispatch(addEntry({ parentPath: destFolder, entry: metaCreated }));
                dispatch(addAsset({ metaObject: { path: copyFile.path, asset } }));
            }
            else{
                await window.api.showError(String(`file extension ${importPath} dont support`));
                return;
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
            if(entryPath.endsWith(".meta.json")){
                await window.api.showError("Cant delete meta file");
                return;
            }
            const { path: scenePath } = getState().sceneManager;
            if(entryPath === scenePath){
                await window.api.showError("Cant delete opening scene");
                return;
            }
            
            await window.api.file.delete(entryPath, recycle);
            dispatch(deleteEntry({ parentPath, entryPath }));

            const metaPath = entryPath + ".meta.json";
            const metaObject = JSON.parse(await window.api.file.getText(metaPath));
            await window.api.file.delete(metaPath, recycle);
            dispatch(deleteEntry({ parentPath, entryPath: metaPath }));
            dispatch(deleteAsset({ guid: metaObject["guid"] }));
        }
        catch(err){
            dispatch(closeProjectThunk());
            await window.api.showError(String(err));
        }
    }
);
