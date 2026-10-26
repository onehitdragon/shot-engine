import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from "path";
import fsExtra from "fs-extra";
import * as fsWalk from "@nodelib/fs.walk";

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpackDir: "node_modules/{better-sqlite3,@img/sharp-*,@shot-engine/ktx-tool}"
    },
  },
  hooks: {
    async packageAfterCopy(forgeConfig, buildPath, electronVersion, platform, arch){
      copyNativeModule(buildPath);
    }
  },
  rebuildConfig: {
    onlyModules: [] // ignore all native modules
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.mts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

/**
 * @ for debug run: $env:DEBUG="electron-forge:*"
 * @param buildPath C:\Users\Admin\AppData\Local\Temp\electron-packager\tmp-QoLmhW\resources\app
 */
function copyNativeModule(buildPath: string){
  const requiredNativePackages = [
    "better-sqlite3", // "better-sqlite3"
    "sharp", "@img", "detect-libc", "semver", // sharp
    "@shot-engine/ktx-tool"
  ];

  const projectPath = path.resolve("..", "..");
  const modulePaths = fsWalk.walkSync(projectPath, {
    entryFilter: (entry) => {
      if(entry.dirent.parentPath.includes("node_modules")) return false;
      return entry.dirent.isDirectory() && entry.name === 'node_modules';
    },
  });
  function findSourcePackagePath(packageName: string){
    let result: string | undefined = undefined;
    for(const modulePath of modulePaths){
      const sourcePackagePath = path.join(modulePath.path, packageName);
      if(!fsExtra.existsSync(sourcePackagePath)) continue;
      if(result) throw `native module ${packageName} duplicated ${result} and ${sourcePackagePath}`;
      result = sourcePackagePath;
    }
    if(!result) throw `cant find native module ${packageName}`;
    return result;
  }

  const destPath = path.join(buildPath, "node_modules");
  for(const packageName of requiredNativePackages){
    let sourcePackagePath = findSourcePackagePath(packageName);
    const destPackagePath = path.join(destPath, packageName);
    if(fsExtra.lstatSync(sourcePackagePath).isSymbolicLink()){
      sourcePackagePath = fsExtra.readlinkSync(sourcePackagePath);
    }
    
    console.log("copy native module", sourcePackagePath, "->", destPackagePath);
    fsExtra.mkdirSync(destPackagePath, { recursive: true });
    fsExtra.copySync(sourcePackagePath, destPackagePath);
  }

  // const allFiles = getAllFiles(buildPath);
  // allFiles.forEach(file => console.log("===", file));
}

export default config;
