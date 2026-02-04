export function fileIsImage(file: DirectoryTree.File){
    return pathIsImage(file.path);
}
export function pathIsImage(path: string){
    const pathLC = path.toLocaleLowerCase();
    return (pathLC.endsWith(".jpg") || pathLC.endsWith(".png"));
}
