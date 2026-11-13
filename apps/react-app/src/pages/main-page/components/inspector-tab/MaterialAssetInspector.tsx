import { useImmer } from "use-immer";
import type { MaterialAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { ImageSelection, OneValueRow, RGBAValueRow, RGBValueRow, SaveButton, Selection, TextRow, ValueSliderRow } from "./components";
import type { MaterialAsset, PbrMaterialAsset, SimpleMaterialAsset } from "@shot-engine/types";
import { useState } from "react";
import { Vec3, Vec4 } from "@shot-engine/math";
import { ColorToVec3, ColorToVec4, Vec3ToColor, Vec4ToColor } from "./helper";
import { useAppDispatch } from "../../../../global-state/hooks";
import { emitAssetChanged } from "../../../../global-state/slices/asset-cache-slice";


export function MaterialAssetInspector(props: { inspector: MaterialAssetInspector }) {
  const { assetInfo, materialAsset } = props.inspector;
  const [matType, setMatType] = useState(materialAsset.matType);
  const dispatch = useAppDispatch();

  function getDefaultSimpleMaterialAsset(): SimpleMaterialAsset{
    if(materialAsset.matType === "simple") return materialAsset;
    return {
      matType: "simple",
      culling: "none",
      transparent: "opaque",
      alphaCutoff: 0,
      color: Vec4.FromValues(1, 1, 1, 1)
    }
  }
  function getDefaultPbrMaterialAsset(): PbrMaterialAsset{
    if(materialAsset.matType === "pbr") return materialAsset;
    return {
      matType: "pbr",
      culling: "none",
      transparent: "opaque",
      alphaCutoff: 0,
      baseFactor: Vec4.FromValues(1, 1, 1, 1),
      roughnessFactor: 0.5,
      metallicFactor: 0,
      normalScale: 1,
      emissitveFactor: Vec3.FromValues(0, 0, 0),
      occlusionStrength: 0,
    }
  }
  function saveButtonCreator(materialAsset: MaterialAsset){
    if(!assetInfo.allowModify) return (<></>);
    const update = async (cancelled: boolean) => {
      const filePath = await window.api.assetManager.getFilePathFromAssetId(assetInfo.uuid);
      if(!filePath || cancelled) return;
      await window.api.assetManager.saveMaterialAssetBinary(materialAsset, filePath);
      if(cancelled) return;
      await window.api.assetManager.rescan();
      dispatch(emitAssetChanged());
    }
    return (<SaveButton label="Apply" handle={update}/>);
  }

  return (
    <div className="flex flex-col gap-1 flex-1 p-1 overflow-auto scrollbar-thin">
      <TextRow label="Id" content={assetInfo.uuid} />
      <Selection label="Material type"
        options={[
          { label: "Simple", value: "simple" },
          { label: "Pbr", value: "pbr" }
        ]}
        value={matType}
        onChange={(value) => {
          setMatType(value);
        }}
      />
      {
        matType === "simple" &&
        <SimpleMaterialAssetEditor simpleMaterialAsset={getDefaultSimpleMaterialAsset()}
          saveButtonCreator={saveButtonCreator}
        />
      }
      {
        matType === "pbr" &&
        <PbrMaterialAssetEditor pbrMaterialAsset={getDefaultPbrMaterialAsset()}
          saveButtonCreator={saveButtonCreator}
        />
      }
    </div>
  );
}
function SimpleMaterialAssetEditor(props: {
  simpleMaterialAsset: SimpleMaterialAsset,
  saveButtonCreator: (materialAsset: MaterialAsset) => React.JSX.Element
}){
  const { simpleMaterialAsset, saveButtonCreator } = props;
  const [assetState, setAssetState] = useImmer(simpleMaterialAsset);

  return (
    <>
      <TextRow label="Surface options" content=""/>
      <Selection label={"Culling"}
        options={
          [
            {
              label: "None",
              value: "none"
            },
            {
              label: "Back",
              value: "back"
            },
            {
              label: "Front",
              value: "front"
            }
          ]
        }
        value={assetState.culling}
        onChange={(value) => {
          setAssetState((state) => {
            state.culling = value;
          })
        }}
      />
      <Selection label={"Transparent"}
        options={
          [
            {
              label: "Opaque",
              value: "opaque"
            },
            {
              label: "Mask",
              value: "mask"
            },
            {
              label: "Blend",
              value: "blend"
            }
          ]
        }
        value={assetState.transparent}
        onChange={(value) => {
          setAssetState((state) => {
            state.transparent = value;
          })
        }}
      />
      {
        assetState.transparent === "mask" &&
        <ValueSliderRow label="Alpha cutoff"
          value={assetState.alphaCutoff}
          range={[0, 1]}
          onChange={(value) => {
            setAssetState(state => {
              state.alphaCutoff = value;
            })
          }}
        />
      }
      <TextRow label="Surface inputs" content=""/>
      <RGBAValueRow label="Color"
        value={Vec4ToColor(assetState.color)}
        onChange={(value) => {
          setAssetState((state) => {
            state.color = ColorToVec4(value);
          })
        }}
      />
      { saveButtonCreator(assetState) }
    </>
  );
}
function PbrMaterialAssetEditor(props: {
  pbrMaterialAsset: PbrMaterialAsset,
  saveButtonCreator: (materialAsset: MaterialAsset) => React.JSX.Element
}){
  const { pbrMaterialAsset, saveButtonCreator } = props;
  const [assetState, setAssetState] = useImmer(pbrMaterialAsset);

  return (
    <>
      <TextRow label="Surface options" content=""/>
      <Selection label={"Culling"}
        options={
          [
            {
              label: "None",
              value: "none"
            },
            {
              label: "Back",
              value: "back"
            },
            {
              label: "Front",
              value: "front"
            }
          ]
        }
        value={assetState.culling}
        onChange={(value) => {
          setAssetState((state) => {
            state.culling = value;
          })
        }}
      />
      <Selection label={"Transparent"}
        options={
          [
            {
              label: "Opaque",
              value: "opaque"
            },
            {
              label: "Mask",
              value: "mask"
            },
            {
              label: "Blend",
              value: "blend"
            }
          ]
        }
        value={assetState.transparent}
        onChange={(value) => {
          setAssetState((state) => {
            state.transparent = value;
          })
        }}
      />
      {
        assetState.transparent === "mask" &&
        <ValueSliderRow label="Alpha cutoff"
          value={assetState.alphaCutoff}
          range={[0, 1]}
          onChange={(value) => {
            setAssetState(state => {
              state.alphaCutoff = value;
            })
          }}
        />
      }
      <TextRow label="Surface inputs" content=""/>
      <ImageSelection label="Base texture"
        imageRef={assetState.baseTextureRef}
        onChange={(value) => {
          setAssetState((state) => {
            state.baseTextureRef = value;
          })
        }}
      />
      <RGBAValueRow label="Base factor"
        value={Vec4ToColor(assetState.baseFactor)}
        onChange={(value) => {
          setAssetState((state) => {
            state.baseFactor = ColorToVec4(value);
          })
        }}
      />
      <ImageSelection label="MR texture"
        imageRef={assetState.metallicRoughnessTextureRef}
        onChange={(value) => {
          setAssetState((state) => {
            state.metallicRoughnessTextureRef = value;
          })
        }}
      />
      <ValueSliderRow label="Roughness"
        value={assetState.roughnessFactor}
        range={[0, 1]}
        onChange={(value) => {
          setAssetState(state => {
            state.roughnessFactor = value;
          })
        }}
      />
      <ValueSliderRow label="Metallic"
        value={assetState.metallicFactor}
        range={[0, 1]}
        onChange={(value) => {
          setAssetState(state => {
            state.metallicFactor = value;
          })
        }}
      />
      <ImageSelection label="Normal texture"
        imageRef={assetState.normalTextureRef}
        onChange={(value) => {
          setAssetState((state) => {
            state.normalTextureRef = value;
          })
        }}
      />
      <OneValueRow label="Normal scale"
        value={assetState.normalScale}
        onChange={(value) => {
          setAssetState(state => {
            state.normalScale = value;
          })
        }}
      />
      <ImageSelection label="Emissive texture"
        imageRef={assetState.emissiveTextureRef}
        onChange={(value) => {
          setAssetState((state) => {
            state.emissiveTextureRef = value;
          })
        }}
      />
      <RGBValueRow label="Emissive factor"
        value={Vec3ToColor(assetState.emissitveFactor)}
        onChange={(value) => {
          setAssetState((state) => {
            state.emissitveFactor = ColorToVec3(value);
          })
        }}
      />
      <ImageSelection label="OC texture"
        imageRef={assetState.occlusionTextureRef}
        onChange={(value) => {
          setAssetState((state) => {
            state.occlusionTextureRef = value;
          })
        }}
      />
      <ValueSliderRow label="OC strength"
        value={assetState.occlusionStrength}
        range={[0, 1]}
        onChange={(value) => {
          setAssetState(state => {
            state.occlusionStrength = value;
          })
        }}
      />
      { saveButtonCreator(assetState) }
    </>
  );
}
