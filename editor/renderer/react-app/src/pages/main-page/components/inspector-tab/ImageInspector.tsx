import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import type { AssetInspector } from "../../../../global-state/slices/inspector-slice";
import { selectAssetByGuid, updateAsset } from "../../../../global-state/slices/asset-manager-slice";
import { createTexture, isAssetImage, type Assets } from "../../../../engine-zod";
import { ButtonRow, CheckBox, Image, OneValueRow, Selection, TextRow } from "./components";

export function AssetInspector(props: { inspector: AssetInspector }){
    const { guid } = props.inspector;
    const asset = useAppSelector(state => selectAssetByGuid(state, guid));
    return (
        <div className="flex flex-col gap-1 flex-1 p-1 overflow-auto scrollbar-thin">
            <TextRow label="guid" content={asset.asset.guid}/>
            {
                isAssetImage(asset.asset) &&
                <AssetImage asset={asset.asset} inspector={props.inspector}/>
            }
        </div>
    );
}
function AssetImage(props: { asset: Assets.AssetImage, inspector: AssetInspector }){
    const { asset, inspector } = props;
    const { image } = asset;
    const [imageType, setImageType] = useState(image.imageType);
    return (
        <>
            <Image path={inspector.path}/>
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
                imageType === "Texture" &&
                <TextureModifier
                    texture={image.imageType === "Texture" ? image : createTexture()}
                    inspector={props.inspector}
                />
            }
        </>
    );
}
function TextureBaseModifer(
    props: {
        textureBase: Assets.TextureBase,
        setTexture: (textureBase: Assets.TextureBase) => void
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
function TextureModifier(props: { texture: Assets.Texture, inspector: AssetInspector }){
    const [texture, setTexture] = useState(props.texture);
    useEffect(() => {
        setTexture(props.texture);
    }, [props.texture])
    const dispatch = useAppDispatch();
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
                        label: "Apply",
                        onClick: async () => {
                            const imageTexture: Assets.AssetImage = {
                                guid: props.inspector.guid,
                                image: { ...texture }
                            }
                            await window.api.file.save(
                                props.inspector.metaPath,
                                JSON.stringify(imageTexture, null, 2)
                            );
                            dispatch(updateAsset({
                                metaObject: {
                                    path: props.inspector.path,
                                    asset: imageTexture
                                }
                            }));
                        }
                    }
                ]}/>
            }
        </>
    );
}
