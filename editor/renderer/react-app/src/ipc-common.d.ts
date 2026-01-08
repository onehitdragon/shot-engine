declare namespace DirectoryTree{
    export type Directory = {
        type: "Directory"
        name: string,
        path: string,
        children: (Directory | File)[]
    }
    export type File = {
        type: "File",
        name: string,
        path: string
    }
}
declare namespace Importer{
    export type JsonImportFile = {
        type: "fbx",
        data: FBXFormat.FBX
    } | {
        type: "scene",
        data: SceneFormat.Scene
    } | {
        type: "assimp",
        data: AssimpFormat.Assimp
    }
}
declare namespace FBXFormat{
    export type NodeRecord = {
        name: string,
        properties: Property[],
        nestedList: NodeRecord[]
    }
    export type Property = {
        typeCode: string
    }
    export type PrimitiveProperty = {
        data: number | bigint
    } & Property
    export type ArrayProperty = {
        data: number[]
    } & Property
    export type SpecialProperty = {
        data: string
    } & Property
    export type FBX = {
        parentObjectNodes: ObjectNode[]
    }
    export type ObjectNode = {
        id: bigint,
        name: string,
        type: "Model" | "Geometry",
        childs: ObjectNode[]
    }
    export type ModelNode = {

    } & ObjectNode
    export type GeometryNode = {
        vertices: number[],
        vertexIndices: number[],
        normals: number[],
        layerElementUV: {
            mappingInformationType: string,
            UVs: number[],
            UVIndices: number[]
        }
    } & ObjectNode
}
declare namespace AssimpFormat{
    export type Mesh = {
        id: string,
        name: string,
        vertices: number[],
        normals: number[],
        faces: number[][]
    }
    export type Node = {
        name: string,
        transformation: number[],
        children: Node[],
        meshes: number[]
    }
    export type Assimp = {
        rootnode: Node,
        meshes: Mesh[]
    }
}
