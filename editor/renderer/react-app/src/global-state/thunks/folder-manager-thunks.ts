import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { type FolderManager } from "../slices/folder-manager-slice";
import { addLog } from "../slices/app-loading-slice";
import { createAssetFolder, createAssetImage, createAssetMesh, createAssetPrefab, type Assets } from "../../engine-zod";
import { createDefaultFolder, createFolderWithMeta, loop, pathIsImage } from "../../pages/main-page/helpers/folder-manager-helper/helper";
import { createAssimpPrefab } from "../../pages/main-page/helpers/scene-manager-helper/SceneNodeHelper";
import { createPrimitivesAssetMesh } from "../../pages/main-page/helpers/scene-manager-helper/mesh-datas";
import { closeSceneThunk } from "./scene-manager-thunks";
import { deleteManyAssetThunk } from "./asset-manager-thunks";

export const projectOpenedThunk = createAsyncThunk
<
    {
        projectPaths: FolderManager.ProjectPaths
        entries: (DirectoryTree.Directory | DirectoryTree.File)[],
        metaObjects: Assets.MetaObject[]
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
            await createDefaultFolder(projectPaths.assetDefault);
            await createDefaultFolder(await window.fsPath.join(projectPaths.asset, "Scenes"));
            await createDefaultFolder(await window.fsPath.join(projectPaths.asset, "Prefabs"));
            await createDefaultFolder(await window.fsPath.join(projectPaths.asset, "Scripts"));
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

            return {
                projectPaths,
                entries,
                metaObjects
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
            await dispatch(closeSceneThunk());
        }
        catch(err){
            await window.api.showError(String(err));
        }
    }
);
export const folderCreatedThunk = createAsyncThunk
<
    {
        dirCreated: DirectoryTree.Directory,
        metaCreated: DirectoryTree.File,
        metaObject: Assets.MetaObject,
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

            if(parentPath.startsWith(projectPaths.assetDefault)) throw "Cant create inside default";
            if(!parentPath.startsWith(projectPaths.asset)) throw "Cant create outside asset";

            const path = await window.fsPath.join(parentPath, name);
            const dirCreated = await window.api.folder.create(path);

            const asset = createAssetFolder();
            const metaName = name + ".meta.json";
            const metaPath = path + ".meta.json";
            await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
            const metaCreated: DirectoryTree.File = {
                type: "File",
                name: metaName,
                path: metaPath
            }
            
            const metaObject: Assets.MetaObject = { path, asset };

            return {
                dirCreated,
                metaCreated,
                metaObject
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
type MeshFile = {
    meshCreated: DirectoryTree.File,
    metaCreated: DirectoryTree.File,
    metaObject: Assets.MetaObject
}
export const fileImportedThunk = createAsyncThunk
<
    {
        fbxImport?: {
            fbxDirCreated: DirectoryTree.Directory,
            fbxDirMetaCreated: DirectoryTree.File,
            fbxDirMetaObject: Assets.MetaObject,
            meshFiles: MeshFile[],
            prefab: {
                prefabCreated: DirectoryTree.File,
                metaCreated: DirectoryTree.File,
                metaObject: Assets.MetaObject
            }
        },
        imageImport?: {
            copyCreated: DirectoryTree.File,
            metaCreated: DirectoryTree.File,
            metaObject: Assets.MetaObject
        }
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
            if(destFolder.startsWith(projectPaths.assetDefault)) throw "Cant import to default file";
            if(!destFolder.startsWith(projectPaths.asset)) throw "importing requires inside the asset path";

            const importPath = await window.api.file.open();
            if(!importPath) throw "need an import path";
            const importName = await window.fsPath.basename(importPath);

            if(importPath.endsWith(".fbx")){
                const fbxDirPath = await window.fsPath.join(destFolder, `[${importName}]`);
                const fbxDirExist = await window.api.file.exist(fbxDirPath);
                if(fbxDirExist) throw "fbx dir was existed";
                const [fbxDirCreated, fbxDirMetaCreated, fbxDirMetaObject] = 
                await createFolderWithMeta(fbxDirPath);

                const { data: assimp } = await window.api.file.assimpImporter(importPath);
                const meshAssets: Assets.AssetMesh[] = [];
                const meshFiles: MeshFile[] = [];
                for(const assimpMesh of assimp.meshes){
                    const mesh: MeshFormat.Mesh = {
                        vertices: assimpMesh.vertices,
                        vertexIndices: assimpMesh.faces.flat(),
                        uvs: assimpMesh.uvs,
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

                    const metaName = meshName + ".meta.json";
                    const metaPath = meshPath + ".meta.json";
                    const asset = createAssetMesh();
                    meshAssets.push(asset);
                    await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                    const metaCreated: DirectoryTree.File = {
                        type: "File",
                        name: metaName,
                        path: metaPath
                    };
                    const metaObject: Assets.MetaObject = { path: meshPath, asset };

                    meshFiles.push({
                        meshCreated,
                        metaCreated,
                        metaObject
                    });
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

                const asset = createAssetPrefab();
                const metaName = prefabName + ".meta.json";
                const metaPath = prefabPath + ".meta.json";
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaCreated: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                };
                const metaObject: Assets.MetaObject = { path: prefabPath, asset };

                return {
                    fbxImport: {
                        fbxDirCreated,
                        fbxDirMetaCreated,
                        fbxDirMetaObject,
                        meshFiles,
                        prefab: {
                            prefabCreated,
                            metaCreated,
                            metaObject
                        }
                    }
                }
            }
            else if(pathIsImage(importPath)){
                const destPath = await window.fsPath.join(destFolder, importName);
                await window.api.file.copy(importPath, destPath);
                const copyCreated: DirectoryTree.File = {
                    type: "File",
                    name: importName,
                    path: destPath
                }
                
                const asset = createAssetImage();
                const metaName = importName + ".meta.json";
                const metaPath = destPath + ".meta.json";
                await window.api.file.save(metaPath, JSON.stringify(asset, null, 2));
                const metaCreated: DirectoryTree.File = {
                    type: "File",
                    name: metaName,
                    path: metaPath
                }
                const metaObject: Assets.MetaObject = { path: copyCreated.path, asset }

                return {
                    imageImport: {
                        copyCreated,
                        metaCreated,
                        metaObject
                    }
                }
            }
            else{
                throw `file extension ${importPath} dont support`;
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
        paths: string[],
        metaEntryPath: string,
        metaPaths: string[]
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

            if(entryPath.endsWith(".meta.json")) throw "Cant delete meta file";
            if(entryPath.startsWith(projectPaths.assetDefault)) throw "Cant delete default file";
            const { path: scenePath } = getState().sceneManager;
            if(entryPath === scenePath) throw "Cant delete opening scene";
            
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

            return {
                paths,
                metaEntryPath,
                metaPaths
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
