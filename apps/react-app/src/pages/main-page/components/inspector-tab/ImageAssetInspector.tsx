import { useEffect, useState } from "react";
import { type ImageAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { ButtonRow, CheckBox, OneValueRow, RawImage, Selection, TextRow } from "./components";
import type { AssetProperty } from "@shot-engine/types";

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
    const [imageType, setImageType] = useState(property.type === "image" ? property.imageType : null);
    if(property.type !== "image" || !imageType) return null;
    return (
        <>
            <RawImage width={imageAsset.width} height={imageAsset.height} data={imageAsset.data}/>
            <Selection
                label="Image type"
                value={imageType}
                options={[
                    { label: "Texture", value: "Texture" },
                    { label: "Normal Map", value: "NormalMap" },
                    { label: "Light Map", value: "LightMap" },
                ]}
                onChange={(value) => {
                    setImageType(value)
                }}
            />
            {
                (imageType === "Texture" && imageType === property.imageType) &&
                <TextureModifier
                    texture={property}
                    inspector={props.inspector}
                />
            }
            {
                (imageType === "Texture" && imageType !== property.imageType) &&
                <TextureModifier
                    texture={{
                        type: "image",
                        imageType: "Texture",
                        sRGB: true,
                        qualityLevel: 255,
                        generateMipmaps: true,
                        wrapMode: "REPEAT",
                        filterMode: "BILINEAR"
                    }}
                    inspector={props.inspector}
                />
            }
        </>
    );
}
function TextureBaseModifer(
    props: {
        textureBase: AssetProperty.TextureBase,
        setTexture: (textureBase: AssetProperty.TextureBase) => void
    }
){
    const { textureBase, setTexture } = props;

    return(
        <>
            <Selection
                label="Wrap mode"
                value={textureBase.wrapMode}
                options={[
                    { label: "REPEAT", value: "REPEAT" },
                    { label: "CLAMP", value: "CLAMP" },
                    { label: "MIRROR", value: "MIRROR" },
                ]}
                onChange={(value) => {
                    setTexture({
                        ...textureBase,
                        wrapMode: value
                    })
                }}
            />
            <Selection
                label="Filter mode"
                value={textureBase.filterMode}
                options={[
                    { label: "NONE", value: "NONE" },
                    { label: "BILINEAR", value: "BILINEAR" },
                    { label: "TRILINEAR", value: "TRILINEAR" },
                ]}
                onChange={(value) => {
                    setTexture({
                        ...textureBase,
                        filterMode: value
                    })
                }}
            />
            <CheckBox
                label="Generate mipmaps"
                value={textureBase.generateMipmaps}
                onChange={(value) => {
                    setTexture({
                        ...textureBase,
                        generateMipmaps: value
                    })
                }}
            />
        </>
    );
}
function TextureModifier(props: { texture: AssetProperty.Texture, inspector: ImageAssetInspector }){
    const [texture, setTexture] = useState(props.texture);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        await window.api.assetManager.updateAssetPropertyByUuid(
            props.inspector.assetInfo.uuid,
            JSON.stringify(texture)
        );
        setSaving(false);
    }

    useEffect(() => {
        setTexture(props.texture);
    }, [props.texture]);

    return(
        <>
            <TextureBaseModifer textureBase={texture} setTexture={(textureBase => {
                setTexture({
                    ...texture,
                    ...textureBase
                });
            })}/>
            <CheckBox
                label="sRGB"
                value={texture.sRGB}
                onChange={(value) => {
                    setTexture({
                        ...texture,
                        sRGB: value
                    })
                }}
            />
            <OneValueRow
                label="Quality level"
                value={texture.qualityLevel}
                onChange={(value) => {
                    setTexture({
                        ...texture,
                        qualityLevel: value
                    })
                }}
            />
            {
                texture !== props.texture &&
                <ButtonRow buttons={[
                    {
                        label: !saving ? "Apply" : "Saving...",
                        onClick: async () => {
                            if(!saving) save();
                        }
                    }
                ]}/>
            }
        </>
    );
}
