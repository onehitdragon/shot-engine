import { useEffect, useState } from "react";
import { type ImageAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { ButtonRow, CheckBox, RawImage, Selection, TextRow } from "./components";
import type { AssetProperty } from "@shot-engine/types";
import { cloneDeep } from "lodash";
import { useAppDispatch } from "../../../../global-state/hooks";
import { inspectAssetThunk } from "../../../../global-state/thunks/inspector-thunks";

export function ImageAssetInspector(props: { inspector: ImageAssetInspector }){
    const { assetInfo } = props.inspector;
    return (
        <div className="flex flex-col gap-1 flex-1 p-1 overflow-auto scrollbar-thin">
            <TextRow label="Id" content={assetInfo.uuid}/>
            <AssetImage inspector={props.inspector}/>
        </div>
    );
}
function AssetImage(props: { inspector: ImageAssetInspector }){
    const { assetInfo, imageAsset } = props.inspector;
    const property = JSON.parse(assetInfo.property) as AssetProperty.Image;
    const [imageProperty, setImageProperty] = useState(property);
    const [saving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const getDefaultImageProperty = (type: AssetProperty.Image["imageType"]): AssetProperty.Image => {
        if(type === "NormalMap"){
            return {
                type: "image",
                imageType: "NormalMap",
                wrapMode: "REPEAT",
                filterMode: "BILINEAR",
                generateMipmaps: false,
            };
        }
        return {
            type: "image",
            imageType: "Texture",
            wrapMode: "REPEAT",
            filterMode: "BILINEAR",
            generateMipmaps: true,
            sRGB: true,
        };
    }
    useEffect(() => {
        let cancelled = false;
        if(!saving) return;
        const save = async () => {
            await window.api.assetManager.updateAssetPropertyByUuid(
                props.inspector.assetInfo.uuid,
                JSON.stringify(imageProperty)
            );
            if(cancelled) return;
            setSaving(false);
            dispatch(inspectAssetThunk({ assetInfo }));
        }
        save();
        return () => {
            cancelled = true;
        }
    }, [saving])

    return (
        <>
            <RawImage imageAsset={imageAsset}/>
            <Selection
                label="Image type"
                value={imageProperty.imageType}
                options={[
                    { label: "Texture", value: "Texture" },
                    { label: "Normal Map", value: "NormalMap" },
                ]}
                onChange={(value) => {
                    setImageProperty(getDefaultImageProperty(value));
                }}
            />
            {
                imageProperty.imageType === "Texture" &&
                <TextureModifier
                    textureProperty={imageProperty}
                    onChange={(value) => {
                        setImageProperty(value);
                    }}
                />
            }
            {
                !saving ?
                <ButtonRow buttons={[
                    {
                        label: "Apply",
                        onClick: () => {
                            setSaving(true);
                        }
                    }
                ]}/> :
                <span>Saving...</span>
            }
        </>
    );
}
function TextureModifier(props: {
    textureProperty: AssetProperty.Texture,
    onChange: (textureProperty: AssetProperty.Texture) => void
}){
    const { textureProperty, onChange } = props;
    const texturePropertyClone = cloneDeep(textureProperty);

    return(
        <>
            <Selection
                label="Wrap mode"
                value={textureProperty.wrapMode}
                options={[
                    { label: "REPEAT", value: "REPEAT" },
                    { label: "CLAMP", value: "CLAMP" },
                    { label: "MIRROR", value: "MIRROR" },
                ]}
                onChange={(value) => {
                    texturePropertyClone.wrapMode = value;
                    onChange(texturePropertyClone);
                }}
            />
            <Selection
                label="Filter mode"
                value={textureProperty.filterMode}
                options={[
                    { label: "NONE", value: "NONE" },
                    { label: "BILINEAR", value: "BILINEAR" },
                    { label: "TRILINEAR", value: "TRILINEAR" },
                ]}
                onChange={(value) => {
                    texturePropertyClone.filterMode = value;
                    onChange(texturePropertyClone);
                }}
            />
            <CheckBox
                label="Generate mipmaps"
                value={textureProperty.generateMipmaps}
                onChange={(value) => {
                    texturePropertyClone.generateMipmaps = value;
                    onChange(texturePropertyClone);
                }}
            />
            <CheckBox
                label="sRGB"
                value={textureProperty.sRGB}
                onChange={(value) => {
                    texturePropertyClone.sRGB = value;
                    onChange(texturePropertyClone);
                }}
            />
        </>
    );
}
