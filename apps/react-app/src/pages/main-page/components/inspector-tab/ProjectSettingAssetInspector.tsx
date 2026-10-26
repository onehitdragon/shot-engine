import type { ProjectSettingAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { AssetList, SaveButton, Selection, TextRow } from "./components";
import { useState } from "react";

export function ProjectSettingAssetInspector(props: { inspector: ProjectSettingAssetInspector }) {
  const { assetInfo, projectSettingAsset } = props.inspector;

  const [scene, setScene] = useState(projectSettingAsset.scene);
  const update = async (cancelled: boolean) => {
    const filePath = await window.api.assetManager.getFilePathFromAssetId(assetInfo.uuid);
    if(!filePath || cancelled) return;
    await window.api.assetManager.saveProjectSettingAssetBinary(
      {
        ...projectSettingAsset,
        scene: { ...scene }
      },
      filePath
    );
    if(cancelled) return;
    await window.api.assetManager.rescan();
  }

  return (
    <div className="flex flex-col gap-1 flex-1 p-1 overflow-auto scrollbar-thin">
      <TextRow label="Id" content={assetInfo.uuid} />
      <TextRow label="Scene setting" content="" />
      <Selection
        label={"Main scene"}
        options={
          scene.importRefs.map(e => {
            return {
              label: e,
              value: e
            }
          })
        }
        value={scene.mainRef || ""}
        onChange={(value) => {
          setScene({
            ...scene,
            mainRef: value || undefined
          });
        }}
      />
      <AssetList
        label="Import scenes"
        uuids={scene.importRefs}
        type="scene"
        onAdd={(uuid) => {
          setScene({
            ...scene,
            importRefs: [...scene.importRefs, uuid]
          });
        }}
        onRemove={(uuid) => {
          setScene({
            ...scene,
            mainRef: uuid !== scene.mainRef ? scene.mainRef : undefined,
            importRefs: scene.importRefs.filter(e => e !== uuid)
          });
        }}
      />
      <SaveButton label="Apply" handle={update}/>
    </div>
  );
}

