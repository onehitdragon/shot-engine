export function getBaseName(path: string){
    return path.split(/[/\\]/).at(-1) || "";
}
