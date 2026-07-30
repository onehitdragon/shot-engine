import { useEffect, useRef, useState } from "react";
import { type JSX } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { clamp } from "lodash";
import type { AssetManager, ImageOrColor, ImageOrValue, OptionalImage } from "@shot-engine/types";
import z from "zod";
import { getDenormalizeColor, getNormalizeColor } from "../../helpers/utils/utils";

const numberStringSchema = z.preprocess(
    (val) => (val === '' || val === null ? NaN : Number(val)),
    z.number()
);
const vec3Schema = z.object({
    x: numberStringSchema,
    y: numberStringSchema,
    z: numberStringSchema,
});
export function ThreeValueRow(
    props: {
        label: string,
        value: {x: number, y: number, z: number},
        onChange: (value: {x: number, y: number, z: number}) => void,
    }
){
    function toString(value: {x: number, y: number, z: number}){
        return { x: value.x.toString(), y: value.y.toString(), z: value.z.toString() }
    }

    const { label, value } = props;
    const [localValue, setLocalValue] = useState(toString(value));

    useEffect(() => {
        setLocalValue(toString(value));
    }, [value.x, value.y, value.z]);

    const handleChange = (axis: 'x' | 'y' | 'z', valStr: string) => {
        const newValue = { ...localValue, [axis]: valStr }
        setLocalValue(newValue);
        const isNumber = vec3Schema.safeParse(newValue);
        if(isNumber.success){
            props.onChange(isNumber.data);
        }
    };
    const onBlur = () => {
        const newValue = {
            x: parseFloat(localValue.x) || 0,
            y: parseFloat(localValue.y) || 0,
            z: parseFloat(localValue.z) || 0
        }
        setLocalValue(toString(newValue));
        props.onChange(newValue);
    }

    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center justify-evenly w-full gap-1">
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    value={localValue.x}
                    onChange={(e) => { handleChange("x", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    value={localValue.y}
                    onChange={(e) => { handleChange("y", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    value={localValue.z}
                    onChange={(e) => { handleChange("z", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
            </div>
        </div>
    );
}
const rgbStringSchema = z.preprocess(
    (val) => (val === '' || val === null ? NaN : Number(val)),
    z.number().min(0).max(255)
);
const rgbSchema = z.object({
    x: rgbStringSchema,
    y: rgbStringSchema,
    z: rgbStringSchema,
});
export function RGBValueRow(
    props: {
        label: string,
        value: {x: number, y: number, z: number}, // 255
        onChange: (value: {x: number, y: number, z: number}) => void // 255
    }
){
    function toString(value: {x: number, y: number, z: number}){
        return { x: value.x.toString(), y: value.y.toString(), z: value.z.toString() }
    }

    const { label, value } = props;
    const [localValue, setLocalValue] = useState(toString(value));

    useEffect(() => {
        setLocalValue(toString(value));
    }, [value.x, value.y, value.z]);

    const handleChange = (axis: 'x' | 'y' | 'z', valStr: string) => {
        const newValue = { ...localValue, [axis]: valStr }
        setLocalValue(newValue);
        const isNumber = rgbSchema.safeParse(newValue);
        if(isNumber.success){
            props.onChange(isNumber.data);
        }
    };
    const onBlur = () => {
        const newValue = {
            x: parseFloat(localValue.x) || 0,
            y: parseFloat(localValue.y) || 0,
            z: parseFloat(localValue.z) || 0
        }
        newValue.x = clamp(newValue.x, 0, 255);
        newValue.y = clamp(newValue.y, 0, 255);
        newValue.z = clamp(newValue.z, 0, 255);
        setLocalValue(toString(newValue));
        props.onChange(newValue);
    }

    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center justify-evenly w-full gap-1">
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    value={localValue.x}
                    onChange={(e) => { handleChange("x", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    value={localValue.y}
                    onChange={(e) => { handleChange("y", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3"
                    value={localValue.z}
                    onChange={(e) => { handleChange("z", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <div style={{background: `rgb(${localValue.x}, ${localValue.y}, ${localValue.z})`}}
                    className="size-3"></div>
            </div>
        </div>
    );
}
export function TextRow(props: {
    label: string,
    content: string
}){
    const { label, content } = props;
    return (
        <div className="flex gap-1">
            <span className="text-white text-sm select-none font-bold">{label}:</span>
            <span className="text-white text-sm select-none">{content}</span>
        </div>
    );
}
export function TextRowErr(props: {
    label: string,
    content: string
}){
    const { label, content } = props;
    return (
        <div className="flex gap-1">
            <span className="text-white text-sm select-none font-bold">{label}:</span>
            <span className="text-red-500 text-sm select-none">{content}</span>
        </div>
    );
}
export function Selection<T extends number | string>(
    props: {
        label: string,
        value: T,
        options: { label: string, value: T }[],
        onChange: (value: T) => void
    }
){
    const { label, value, options, onChange } = props;
    const safeValue = options.some(e => e.value === value) ? value : "";
    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center w-full gap-1">
                <select className="cursor-pointer outline-none text-sm border"
                    value={safeValue}
                    onChange={(e) => {
                        onChange(e.target.value as T);
                    }}
                >
                    <option value="" disabled>Select</option>
                    {
                        options.map(opt => 
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        )
                    }
                </select>
            </div>
        </div>
    );
}
export function ImageOrColorSelection(props: {
    label: string,
    imageOrColor: ImageOrColor,
    onChange: (imageOrColor: ImageOrColor) => void,
}){
    const { label, imageOrColor, onChange } = props;
    const [imageAssetInfos, setImageAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if(imageOrColor.type === "color") setImageAssetInfos([]);
            else{
                const assetInfos = await window.api.assetManager.getAssetInfosFromType("image");
                if(cancelled) return;
                setImageAssetInfos(assetInfos);
            }
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [imageOrColor.type]);

    return <>
        <Selection
            label={label}
            options={[
                { label: "image", value: "image" },
                { label: "color", value: "color" },
            ]}
            value={imageOrColor.type}
            onChange={(value) => {
                if(value === "color"){
                    onChange({
                        type: "color",
                        color: { x: 1, y: 1, z: 1 }
                    });
                }
                else{
                    onChange({
                        type: "image",
                        imageRef: ""
                    });
                }
            }}
        />
        {
            imageOrColor.type === "color" &&
            <RGBValueRow
                label={`${label} color`}
                value={getDenormalizeColor(imageOrColor.color)}
                onChange={(value) => {
                    onChange({
                        type: "color",
                        color: getNormalizeColor(value)
                    });
                }
            }/>
        }
        {
            imageOrColor.type === "image" &&
            <Selection
                label={`${label} image`}
                options={
                    imageAssetInfos.map(e => {
                        return {
                            label: e.name,
                            value: e.uuid
                        }
                    })
                }
                value={imageOrColor.imageRef}
                onChange={(value) => {
                    onChange({
                        type: "image",
                        imageRef: value
                    });
                }}
            />
        }
    </>
}
export function ImageOrValueSelection(props: {
    label: string,
    imageOrValue: ImageOrValue,
    onChange: (imageOrValue: ImageOrValue) => void,
    valueConfig: { default: number, range: [number, number] }
}){
    const { label, imageOrValue, onChange, valueConfig } = props;
    const [imageAssetInfos, setImageAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if(imageOrValue.type === "value") setImageAssetInfos([]);
            else{
                const assetInfos = await window.api.assetManager.getAssetInfosFromType("image");
                if(cancelled) return;
                setImageAssetInfos(assetInfos);
            }
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [imageOrValue.type]);

    return <>
        <Selection
            label={label}
            options={[
                { label: "image", value: "image" },
                { label: "value", value: "value" },
            ]}
            value={imageOrValue.type}
            onChange={(value) => {
                if(value === "value"){
                    onChange({
                        type: "value",
                        value: valueConfig.default
                    });
                }
                else{
                    onChange({
                        type: "image",
                        imageRef: ""
                    });
                }
            }}
        />
        {
            imageOrValue.type === "value" &&
            <OneValueRow
                label={`${label} value`}
                value={imageOrValue.value}
                range={valueConfig.range}
                onChange={(value) => {
                    onChange({
                        type: "value",
                        value
                    });
                }}
            />
        }
        {
            imageOrValue.type === "image" &&
            <Selection
                label={`${label} image`}
                options={
                    imageAssetInfos.map(e => {
                        return {
                            label: e.name,
                            value: e.uuid
                        }
                    })
                }
                value={imageOrValue.imageRef}
                onChange={(value) => {
                    onChange({
                        type: "image",
                        imageRef: value
                    });
                }}
            />
        }
    </>
}
export function OptionalImageSelection(props: {
    label: string,
    optionalImage: OptionalImage,
    onChange: (optionalImage: OptionalImage) => void,
}){
    const { label, optionalImage, onChange } = props;
    const [imageAssetInfos, setImageAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if(optionalImage.type === "none") setImageAssetInfos([]);
            else{
                const assetInfos = await window.api.assetManager.getAssetInfosFromType("image");
                if(cancelled) return;
                setImageAssetInfos(assetInfos);
            }
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [optionalImage.type]);

    return <>
        <Selection
            label={label}
            options={[
                { label: "image", value: "image" },
                { label: "none", value: "none" },
            ]}
            value={optionalImage.type}
            onChange={(value) => {
                if(value === "none"){
                    onChange({
                        type: "none"
                    });
                }
                else{
                    onChange({
                        type: "image",
                        imageRef: ""
                    });
                }
            }}
        />
        {
            optionalImage.type === "image" &&
            <Selection
                label={`${label} image`}
                options={
                    imageAssetInfos.map(e => {
                        return {
                            label: e.name,
                            value: e.uuid
                        }
                    })
                }
                value={optionalImage.imageRef}
                onChange={(value) => {
                    onChange({
                        type: "image",
                        imageRef: value
                    });
                }}
            />
        }
    </>
}
export function CheckBox(
    props: {
        label: string,
        value: boolean,
        onChange: (value: boolean) => void
    }
){
    const { label, value, onChange } = props;
    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center w-full gap-1">
                <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)}
                    className="accent-black cursor-pointer size-3.5"
                />
            </div>
        </div>
    );
}
export function OneValueRow(
    props: {
        label: string,
        value: number,
        range?: [number, number]
        onChange: (value: number) => void
    }
){
    const { label, value, range, onChange } = props;
    const [valueState, setValue] = useState(value.toString());
    const onBlurValue = () => {
        let num = stringToNumber(valueState);
        if(range){
            num = clamp(num, range[0], range[1]);
        }
        setValue(num.toString());
        onChange(num);
    }
    const stringToNumber = (s: string) => {
        return Number(s);
    }

    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center w-full gap-1">
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={valueState}
                    onBlur={onBlurValue}
                    onKeyDown={(e) => e.key === "Enter" && onBlurValue()}
                    onChange={(e) => { setValue(e.target.value) }}
                />
            </div>
        </div>
    );
}
export function ButtonRow(
    props: {
        buttons: {
            label: string,
            onClick: () => void
        }[]
    }
){
    const { buttons } = props;
    return (
        <div className="flex items-center flex-row-reverse">
            {
                buttons.map((button, index) => {
                    return <button key={index}
                        className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                            transition select-none cursor-pointer rounded"
                        onClick={button.onClick}
                    >
                        {button.label}
                    </button>;
                })
            }
            
        </div>
    );
}
export function Image(props: { path: string }){
    const [src, setSrc] = useState("");
    useEffect(() => {
        let cancel = false;
        const handle = async () => {
            const dataURL = await window.api.file.loadDataURL(props.path);
            if(!cancel) setSrc(dataURL);
        }
        handle();
        return () => {
            cancel = true;
        }
    }, [props.path])
    return (
        <div className="flex justify-center">
            {
                src &&
                <img className="size-36" src={src}/>
            }
        </div>
    );
}
export function RawImage(props: { width: number, height: number, data: Uint8Array }){
    const { width, height, data } = props;
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if(!canvas) return;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if(!ctx) return;
        const imageData = new ImageData(
            new Uint8ClampedArray(data),
            width,
            height,
        );
        ctx.putImageData(imageData, 0, 0);

    }, [width, height, data])

    return (
        <div className="flex justify-center">
            <canvas className="w-36" ref={ref}/>
        </div>
    );
}
export function CollapsedList(props: { label: string, listGenerator: () => JSX.Element[] }){
    const { label, listGenerator } = props;
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="flex flex-col">
            <div className="flex items-center cursor-pointer transition hover:opacity-80"
                onClick={() => setCollapsed(!collapsed)}
            >
                <span className="select-none text-sm text-white">{label}</span>
                <div className="h-0.5 flex-1 bg-gray-600 mx-1"></div>
                {
                    collapsed ?
                    <ChevronRightIcon className="size-4 text-white"/> :
                    <ChevronDownIcon className="size-4 text-white"/>
                }
            </div>
            {
                !collapsed &&
                <ul className="flex flex-col">
                    { listGenerator() }
                </ul>
            }
        </div>
    );
}
