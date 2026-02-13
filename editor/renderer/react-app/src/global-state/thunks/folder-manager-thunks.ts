import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { addEntry, deleteEntry, type FolderManager } from "../slices/folder-manager-slice";
import { addLog, updateLoading } from "../slices/app-loading-slice";
import { createAssetFolder, createAssetImage, createAssetMesh, createAssetPrefab, type Assets } from "../../engine-zod";
import { createFolder, loop, pathIsImage } from "../../pages/main-page/helpers/folder-manager-helper/helper";
import { addAsset, recreate } from "../slices/asset-manager-slice";
import { createAssimpPrefab } from "../../pages/main-page/helpers/scene-manager-helper/SceneNodeHelper";
import { createPrimitivesAssetMesh } from "../../pages/main-page/helpers/scene-manager-helper/mesh-datas";
import { closeSceneThunk } from "./scene-manager-thunks";
import { deleteManyAssetThunk } from "./asset-manager-thunks";

export const openProjectThunk = createAsyncThunk
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
    "folder-manager/openProject",
    async ({ path }, { getState, dispatch, rejectWithValue }) => {
        try{
            dispatch(updateLoading({ loading: true }));

            dispatch(addLog({ log: `Opening project... ${path}` }));
            let projectPaths = getState().folderManager.projectPaths;
            if(projectPaths) throw "having a project is opening";
            projectPaths = {
                project: path,
                asset: await window.fsPath.join(path, "Assets"),
                assetDefault: await window.fsPath.join(path, "Assets", ".default"),
                resource: await window.fsPath.join(path, "Library", "Resource"),
            }
            await window.api.folder.create(projectPaths.asset);
            await window.api.folder.create(projectPaths.resource);
            await createFolder(projectPaths.assetDefault);
            await createFolder(await window.fsPath.join(projectPaths.asset, "Scenes"));
            await createFolder(await window.fsPath.join(projectPaths.asset, "Prefabs"));
            await createFolder(await window.fsPath.join(projectPaths.asset, "Scripts"));
            await createPrimitivesAssetMesh(projectPaths.assetDefault);

            const entries = await window.api.folder.load(projectPaths.asset);

            dispatch(addLog({ log: `Loading assets... ${path}` }));
            const metaEntries = entries.filter(entry => entry.name.endsWith(".meta.json"));
            const metaObjects: Assets.MetaObject[] = [];
            for(const { path } of metaEntries){
                const json = await window.api.file.getText(path);
                const jsonObject = JSON.parse(json) as Assets.Asset;
                metaObjects.push({ path: path.replace(".meta.json", ""), asset: jsonObject });
            }
            dispatch(recreate({ metaObjects }));

            return {
                projectPaths,
                entries
            };
        }
        catch(err){
            await dispatch(closeProjectThunk());
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
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";
            await dispatch(closeSceneThunk());
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
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";

            if(parentPath.startsWith(projectPaths.assetDefault)){
                await window.api.showError("Cant create inside default");
                return;
            }

            const path = await window.fsPath.join(parentPath, name);
            const created = await window.api.folder.create(path);
            if(path.startsWith(projectPaths.asset)){
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
            await dispatch(closeProjectThunk());
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
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";
            if(destFolder.startsWith(projectPaths.assetDefault)){
                await window.api.showError("Cant import to default file");
                return;
            }
            if(!destFolder.startsWith(projectPaths.asset)){
                await window.api.showError(String("importing requires inside the asset path"));
                return;
            }

            const importPath = await window.api.file.open();
            if(!importPath) return;
            const importName = await window.fsPath.basename(importPath);

            if(importPath.endsWith(".fbx")){
                const fbxDirPath = await window.fsPath.join(destFolder, `[${importName}]`);
                const fbxDirExist = await window.api.file.exist(fbxDirPath);
                if(fbxDirExist){
                    await window.api.showError(String("fbx dir was existed"));
                    return;
                }
                await createFolder(fbxDirPath, dispatch);

                const { data: assimp } = await window.api.file.assimpImporter(importPath);
                const meshAssets: Assets.AssetMesh[] = [];
                for(const assimpMesh of assimp.meshes){
                    const mesh: MeshFormat.Mesh = {
                        vertices: assimpMesh.vertices,
                        vertexIndices: assimpMesh.faces.flat(),
                        normals: assimpMesh.normals
                    }
                    const meshName = `[${importName}]${assimpMesh.name}.mesh.json`;
                    const meshPath = await window.fsPath.join(fbxDirPath, meshName);
                    await window.api.file.save(meshPath, JSON.stringify(mesh, null, 2));
                    const meshCreated: DirectoryTree.File = {
                        type: "File",
                        name: meshName,
                        path: meshPath
                    };
                    dispatch(addEntry({ parentPath: fbxDirPath, entry: meshCreated }));

                    const asset = createAssetMesh();
                    const metaName = meshName + ".meta.json";
                    const metaPath = meshPath + ".meta.json";
                    await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                    const metaCreated: DirectoryTree.File = {
                        type: "File",
                        name: metaName,
                        path: metaPath
                    };
                    dispatch(addEntry({ parentPath: fbxDirPath, entry: metaCreated }));
                    dispatch(addAsset({ metaObject: { path: meshPath, asset } }));
                    meshAssets.push(asset);
                }

                const prefab = createAssimpPrefab(assimp.rootnode, meshAssets);
                const prefabName = `[${importName}]${assimp.rootnode.name}.prefab.json`;
                const prefabPath = await window.fsPath.join(fbxDirPath, prefabName);
                await window.api.file.save(prefabPath, JSON.stringify(prefab, null, 2));
                const prefabCreated: DirectoryTree.File = {
                    type: "File",
                    name: prefabName,
                    path: prefabPath
                };
                dispatch(addEntry({ parentPath: fbxDirPath, entry: prefabCreated }));

                const asset = createAssetPrefab();
                const metaName = prefabName + ".meta.json";
                const metaPath = prefabPath + ".meta.json";
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaCreated: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                };
                dispatch(addEntry({ parentPath: fbxDirPath, entry: metaCreated }));
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
            await dispatch(closeProjectThunk());
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
            dispatch(updateLoading({ loading: true }));
            const projectPaths = getState().folderManager.projectPaths;
            if(!projectPaths) throw "no project has been opened yet";

            if(entryPath.endsWith(".meta.json")){
                await window.api.showError("Cant delete meta file");
                return;
            }
            if(entryPath.startsWith(projectPaths.assetDefault)){
                await window.api.showError("Cant delete default file");
                return;
            }
            const { path: scenePath } = getState().sceneManager;
            if(entryPath === scenePath){
                await window.api.showError("Cant delete opening scene");
                return;
            }
            
            const metaEntryPath = entryPath + ".meta.json";
            const paths: string[] = [];
            const metaPaths: string[] = [];
            loop(entryPath, getState().folderManager.entities, (entry, metatEntry) => {
                paths.push(entry.path);
                metaPaths.push(metatEntry.path);
            });

            const guids: string[] = [];
            for(const metaPath of metaPaths){
                const metaObject = JSON.parse(await window.api.file.getText(metaPath)) as Assets.Asset;
                guids.push(metaObject.guid);
            }
            await dispatch(deleteManyAssetThunk({ guids }));

            for(const path of paths.concat(metaPaths)){
                await window.api.file.delete(path, recycle);
            }
            dispatch(deleteEntry({ entryPath, parentPath, paths }));
            dispatch(deleteEntry({ entryPath: metaEntryPath, parentPath, paths: metaPaths }));
        }
        catch(err){
            await dispatch(closeProjectThunk());
            await window.api.showError(String(err));
        }
        finally{
            dispatch(updateLoading({ loading: false }));
        }
    }
);
