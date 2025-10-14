interface Window{
    versions: Versions
}
interface Versions {
  chrome: () => string;
  node: () => string;
  electron: () => string;
  ping: () => Promise<any>
}
declare const versions: Versions;
