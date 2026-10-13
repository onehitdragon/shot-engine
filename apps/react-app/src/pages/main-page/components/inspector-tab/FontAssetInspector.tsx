import { useState } from "react";
import { useAppDispatch } from "../../../../global-state/hooks";
import { type FontAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { bakeFontFileThunk, inspectAssetThunk } from "../../../../global-state/thunks/inspector-thunks";
import { ButtonRow, OneValueRow, Selection, TextRow } from "./components";
import type { FontAssetBakeSetting } from "@shot-engine/types";

export function FontAssetInspector(props: { inspector: FontAssetInspector }){
  const { assetInfo, fontAsset } = props.inspector;
  const [bakeSetting, setBakeSetting] = useState<FontAssetBakeSetting>({
    fieldType: fontAsset?.bakeSetting.fieldType || 0,
    fontSize: fontAsset?.bakeSetting.fontSize || 42,
    textureHeight: fontAsset?.bakeSetting.textureHeight || 512,
    textureWidth: fontAsset?.bakeSetting.textureWidth || 512,
  });
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-1 flex-1 p-1 overflow-auto scrollbar-thin">
      <TextRow label="Id" content={assetInfo.uuid}/>
      <Selection
        label="Field type"
        options={[{ label: "sdf", value: 0 }, { label: "msdf", value: 1 }]}
        value={bakeSetting.fieldType}
        onChange={(value) => {
          setBakeSetting({...bakeSetting, fieldType: value})
        }}
      />
      <OneValueRow
        label="Font size"
        value={bakeSetting.fontSize}
        onChange={(value) => {
          setBakeSetting({...bakeSetting, fontSize: value})
        }}
      />
      <OneValueRow
        label="Texture width"
        value={bakeSetting.textureWidth}
        onChange={(value) => {
          setBakeSetting({...bakeSetting, textureWidth: value})
        }}
      />
      <OneValueRow
        label="Texture height"
        value={bakeSetting.textureHeight}
        onChange={(value) => {
          setBakeSetting({...bakeSetting, textureHeight: value})
        }}
      />

      <TextRow label="Status" content={fontAsset ? "Baked" : "Not Baked"}/>
      <ButtonRow buttons={[
        {
          label: "Bake",
          onClick: () => {
            dispatch(bakeFontFileThunk({
              assetInfo,
              fontAssetBakeSetting: bakeSetting,
              complete: () => {
                dispatch(inspectAssetThunk({ assetInfo }));
              }
            }));
          }
        }
      ]}/>
    </div>
  );
}