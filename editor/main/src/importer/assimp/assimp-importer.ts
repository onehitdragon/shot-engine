import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises"
import path from "path";

const execPromise = promisify(exec);

function createNode(nodeJson: any){
    const node: AssimpFormat.Node = {
        name: nodeJson["name"] ?? "",
        transformation: nodeJson["transformation"] ?? [],
        meshes: nodeJson["meshes"] ?? [],
        children: []
    };
    const childrenJson = nodeJson["children"];
    if(!childrenJson) return node;
    for(const childJson of childrenJson){
        node.children.push(createNode(childJson));
    }
    return node;
}
function createMeshes(meshesJson: any){
    const meshes: AssimpFormat.Mesh[] = [];
    for(const meshJson of meshesJson){
        const name = meshJson["name"] ?? "";
        const mesh: AssimpFormat.Mesh = {
            name: name,
            vertices: meshJson["vertices"] ?? [],
            normals: meshJson["normals"] ?? [],
            faces: meshJson["faces"] ?? []
        }
        meshes.push(mesh);
    }
    return meshes;
}
async function assimpImporter(inPath: string){
    const jsonPath = path.join(__dirname, "test.json");
    const processResult = await execPromise(
        `assimp export ${inPath} ${jsonPath} -f assjson`
    );
    // console.log(processResult);
    const jsonFile = await fs.readFile(jsonPath);
    const json = JSON.parse(jsonFile.toString());
    const rootJson = json["rootnode"];
    if(!rootJson) throw "cant find rootnode in json";
    const meshesJson = json["meshes"];
    if(!meshesJson) throw "cant find meshes in json";
    const assimpFormat: AssimpFormat.Assimp = {
        rootnode: createNode(rootJson),
        meshes: createMeshes(meshesJson)
    }
    return assimpFormat;
}
export { assimpImporter }
