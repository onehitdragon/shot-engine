import { useEffect, useRef, useState } from "react";
import { type JSX } from "react";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/solid";
import { clamp } from "lodash";
import type { AssetManager, ImageAsset, TextOrString } from "@shot-engine/types";
import z from "zod";
import { KTXTranscoder } from "@shot-engine/ktx-tool/transcoder";
import { ArrowPathIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "../../../../global-state/hooks";
import { selectNodes } from "../../../../global-state/slices/go-tree-slice";

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
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center gap-1">
                <input className="outline-none border text-sm px-0.5 w-16"
                    value={localValue.x}
                    onChange={(e) => { handleChange("x", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-16"
                    value={localValue.y}
                    onChange={(e) => { handleChange("y", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-16"
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
const rgbaSchema = z.object({
    x: rgbStringSchema,
    y: rgbStringSchema,
    z: rgbStringSchema,
    w: rgbStringSchema
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
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center gap-1">
                <input className="outline-none border text-sm px-0.5 w-12"
                    value={localValue.x}
                    onChange={(e) => { handleChange("x", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-12"
                    value={localValue.y}
                    onChange={(e) => { handleChange("y", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-12"
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
export function RGBAValueRow(
    props: {
        label: string,
        value: {x: number, y: number, z: number, w: number}, // 255
        onChange: (value: {x: number, y: number, z: number, w: number}) => void // 255
    }
){
    function toString(value: {x: number, y: number, z: number, w: number}){
        return { x: value.x.toString(), y: value.y.toString(), z: value.z.toString(), w: value.w.toString() }
    }

    const { label, value } = props;
    const [localValue, setLocalValue] = useState(toString(value));

    useEffect(() => {
        setLocalValue(toString(value));
    }, [value.x, value.y, value.z, value.w]);

    const handleChange = (axis: 'x' | 'y' | 'z' | 'w', valStr: string) => {
        const newValue = { ...localValue, [axis]: valStr }
        setLocalValue(newValue);
        const isNumber = rgbaSchema.safeParse(newValue);
        if(isNumber.success){
            props.onChange(isNumber.data);
        }
    };
    const onBlur = () => {
        const newValue = {
            x: parseFloat(localValue.x) || 0,
            y: parseFloat(localValue.y) || 0,
            z: parseFloat(localValue.z) || 0,
            w: parseFloat(localValue.w) || 0,
        }
        newValue.x = clamp(newValue.x, 0, 255);
        newValue.y = clamp(newValue.y, 0, 255);
        newValue.z = clamp(newValue.z, 0, 255);
        newValue.w = clamp(newValue.w, 0, 255);
        setLocalValue(toString(newValue));
        props.onChange(newValue);
    }

    return (
        <div className="flex items-center my-0.5">
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center gap-1">
                <input className="outline-none border text-sm px-0.5 w-12"
                    value={localValue.x}
                    onChange={(e) => { handleChange("x", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-12"
                    value={localValue.y}
                    onChange={(e) => { handleChange("y", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-12"
                    value={localValue.z}
                    onChange={(e) => { handleChange("z", e.target.value) }}
                    onBlur={onBlur}
                    onKeyDown={(e) => e.key === "Enter" && onBlur()}
                />
                <input className="outline-none border text-sm px-0.5 w-12"
                    value={localValue.w}
                    onChange={(e) => { handleChange("w", e.target.value) }}
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
            <span className="text-white text-sm select-none line-clamp-1">{content}</span>
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
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex">
                <select className="cursor-pointer outline-none text-sm border max-w-48"
                    value={safeValue}
                    onChange={(e) => {
                        if(typeof value === "number"){
                            onChange(Number(e.target.value) as T);
                        }
                        else{
                            onChange(e.target.value as T);
                        }
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
export function ImageSelection(props: {
    label: string,
    imageRef?: string,
    onChange: (imageRef?: string) => void,
}){
    const { label, imageRef, onChange } = props;
    const [imageAssetInfos, setImageAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType("image");
            if(cancelled) return;
            setImageAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, []);

    return (
        <Selection
            label={label}
            options={[
                { label: "None", value: "" },
                ...imageAssetInfos.map(e => {
                    return {
                        label: e.name,
                        value: e.uuid
                    }
                })
            ]}
            value={imageRef || ""}
            onChange={(value) => {
                onChange(value || undefined);
            }}
        />
    );
}
export function MeshSelection(props: {
    label: string,
    uuidRef?: string,
    onChange: (uuidRef?: string) => void,
}){
    const { label, uuidRef, onChange } = props;
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType("mesh");
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, []);

    return (
        <Selection
            label={label}
            options={[
                { label: "None", value: "" },
                ...assetInfos.map(e => {
                    return {
                        label: e.name,
                        value: e.uuid
                    }
                })
            ]}
            value={uuidRef || ""}
            onChange={(value) => {
                onChange(value || undefined);
            }}
        />
    );
}
export function MaterialSelection(props: {
    label: string,
    uuidRef?: string,
    onChange: (uuidRef?: string) => void,
}){
    const { label, uuidRef, onChange } = props;
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType("material");
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, []);

    return (
        <Selection
            label={label}
            options={[
                { label: "None", value: "" },
                ...assetInfos.map(e => {
                    return {
                        label: e.name,
                        value: e.uuid
                    }
                })
            ]}
            value={uuidRef || ""}
            onChange={(value) => {
                onChange(value || undefined);
            }}
        />
    );
}
export function TextOrStringSelection(props: {
    label: string,
    textOrString: TextOrString,
    onChange: (textOrString: TextOrString) => void,
}){
    const { label, textOrString, onChange } = props;
    const [textAssetInfos, setTextAssetInfos] = useState<AssetManager.AssetInfo[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if(textOrString.type === "string") setTextAssetInfos([]);
            else{
                const assetInfos = await window.api.assetManager.getAssetInfosFromType("text");
                if(cancelled) return;
                setTextAssetInfos(assetInfos);
            }
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [textOrString.type]);

    return <>
        <Selection
            label={label}
            options={[
                { label: "text", value: "text" },
                { label: "string", value: "string" },
            ]}
            value={textOrString.type}
            onChange={(value) => {
                if(value === "string"){
                    onChange({
                        type: "string",
                        value: ""
                    });
                }
                else{
                    onChange({
                        type: "text",
                        textRef: ""
                    });
                }
            }}
        />
        {
            textOrString.type === "string" &&
            <TextAreaRow
                label={`${label} string`}
                value={textOrString.value}
                onChange={(value) => {
                    onChange({
                        type: "string",
                        value
                    });
                }
            }/>
        }
        {
            textOrString.type === "text" &&
            <Selection
                label={`${label} text`}
                options={
                    textAssetInfos.map(e => {
                        return {
                            label: e.name,
                            value: e.uuid
                        }
                    })
                }
                value={textOrString.textRef}
                onChange={(value) => {
                    onChange({
                        type: "text",
                        textRef: value
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
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center">
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
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center">
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number" value={valueState}
                    onBlur={onBlurValue}
                    onKeyDown={(e) => e.key === "Enter" && onBlurValue()}
                    onChange={(e) => { setValue(e.target.value) }}
                />
            </div>
        </div>
    );
}
export function ValueSliderRow(
    props: {
        label: string,
        value: number,
        range: [number, number]
        onChange: (value: number) => void
    }
){
    const { label, value, range, onChange } = props;

    return (
        <div className="flex items-center my-0.5">
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center gap-1">
                <input className="w-full h-1 bg-neutral-400 rounded-full appearance-none cursor-pointer" type="range"
                    min={range[0]} max={range[1]} step={0.01}
                    value={value}
                    onChange={(e) => { onChange(Number(e.target.value)) }}
                />
                <input className="outline-none border text-sm px-0.5 w-1/3" type="number"
                    min={range[0]} max={range[1]} step={0.01}
                    value={value}
                    onChange={(e) => { onChange(clamp(Number(e.target.value), range[0], range[1])) }}
                />
            </div>
        </div>
    );
}
export function OneInputRow(
    props: {
        label: string,
        value: string,
        onChange: (value: string) => void
    }
){
    const { label, value, onChange } = props;
    const [valueState, setValue] = useState(value);
    const onBlurValue = () => {
        setValue(valueState);
        onChange(valueState);
    }

    return (
        <div className="flex items-center my-0.5">
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center">
                <input className="outline-none border text-sm px-0.5 w-1/3" value={valueState}
                    onBlur={onBlurValue}
                    onKeyDown={(e) => e.key === "Enter" && onBlurValue()}
                    onChange={(e) => { setValue(e.target.value) }}
                />
            </div>
        </div>
    );
}
export function TextAreaRow(
    props: {
        label: string,
        value: string,
        onChange: (value: string) => void
    }
){
    const { label, value, onChange } = props;
    const [valueState, setValue] = useState(value);
    const onBlurValue = () => {
        setValue(valueState);
        onChange(valueState);
    }

    return (
        <div className="flex items-center my-0.5">
            <div className="mr-1 w-24">
                <span className="select-none text-sm text-white">{label}:</span>
            </div>
            <div className="flex items-center">
                <textarea rows={5} className="outline-none border text-sm px-0.5 flex-1" value={valueState}
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
export function Button(
    props: {
        label: string,
        onClick: () => void
    }
){
    const { label, onClick } = props;
    return (
        <button
            className="text-sm text-white w-fit py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
            onClick={onClick}
        >
            {label}
        </button>
    );
}
export function SaveButton(
    props: {
        label: string,
        handle?: (cancelled: boolean) => Promise<void>
    }
){
    const { label, handle } = props;
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if(!saving) return;
        let cancel = false;
        const task = async () => {
            await handle?.(cancel);
            setSaving(false);
        }
        task();
        return () => {
            cancel = true;
        }
    }, [saving]);

    return (
        <button
            className="text-sm text-white w-fit py-1 px-2 bg-slate-600 hover:opacity-80
                transition select-none cursor-pointer rounded"
            onClick={() => {
                setSaving(true);
            }}
        >
            {
                !saving ? label : <ArrowPathIcon className="size-5 animate-spin"/>
            }
        </button>
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
export function RawImage(props: { imageAsset: ImageAsset }){
    const { imageAsset } = props;
    const ref = useRef<HTMLCanvasElement>(null);
    const [rawImages, setRawImages] = useState<{
        info: { origWidth: number, origHeight: number },
        compressed: Uint8Array
    }[]>([]);
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const task = async () => {
            const ktxTranscoder = KTXTranscoder.getInstance();
            await ktxTranscoder.init();
            if(cancelled) return;
            const rawRGBAs = await ktxTranscoder.transcode(imageAsset.ktx2, "rgba");
            if(cancelled) return;
            setRawImages(rawRGBAs);
            setSlideIndex(0);
        }
        task();
        return () => {
            cancelled = true
        };
    }, [imageAsset]);

    useEffect(() => {
        if(rawImages.length === 0) return;
        const { info, compressed } = rawImages[slideIndex];
        const { origWidth, origHeight } = info;

        const canvas = ref.current;
        if(!canvas) return;
        canvas.width = origWidth;
        canvas.height = origHeight;

        const ctx = canvas.getContext("2d");
        if(!ctx) return;
        const imageData = new ImageData(
            new Uint8ClampedArray(compressed),
            canvas.width,
            canvas.height,
        );
        ctx.putImageData(imageData, 0, 0);
    }, [rawImages, slideIndex]);

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex justify-center gap-1">
                <span className="w-5">{slideIndex}</span>
                <input
                    className="cursor-pointer"
                    type="range"
                    min={0} max={rawImages.length - 1}
                    value={slideIndex}
                    onChange={(e) => { setSlideIndex(Number(e.target.value)) }}
                />
                <span className="">{rawImages.length - 1}</span>
            </div>
            <canvas className="w-40 h-auto" ref={ref}/>
        </div>
    );
}
export function CollapsedList(props: {
    label: string, listGenerator: () => (JSX.Element | undefined)[], collapsed?: boolean
}){
    const { label, listGenerator } = props;
    const [collapsed, setCollapsed] = useState(props.collapsed);

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
                <ul className="flex flex-col gap-1">
                    { listGenerator() }
                </ul>
            }
        </div>
    );
}
export function AssetInfoRow(props: { uuid: string }){
    const [assetInfo, setAssetInfo] = useState<AssetManager.AssetInfo>();
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            let assetInfo = await window.api.assetManager.getAssetInfoFromUuid(props.uuid);
            if(cancelled) return;
            setAssetInfo(assetInfo);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, []);
    return (
        !assetInfo ?
        <TextRowErr label="" content={props.uuid}/> :
        <TextRow label={assetInfo.name} content={assetInfo.uuid}/>
    );
}
export function AssetList(props: {
    label: string,
    uuids: string[],
    type: AssetManager.AssetInfo["type"],
    onAdd?: (uuid: string) => void,
    onRemove?: (uuid: string, assetInfo: AssetManager.AssetInfo) => void,
}){
    const { label, uuids, type, onAdd, onRemove } = props;
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const [curId, setCurId] = useState("");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType(type);
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [uuids]);

    return <div className="flex flex-col gap-1">
        <TextRow label={label} content=""/>
        <div className="flex gap-1">
            <Selection
                label="Select"
                options={assetInfos.filter(e => !uuids.some(id => id === e.uuid)).map((e) => {
                    return {
                        label: e.name,
                        value: e.uuid
                    }
                })}
                value={curId}
                onChange={(value) => {
                    setCurId(value)
                }}
            />
            {
                curId &&
                <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                    transition select-none cursor-pointer rounded"
                    onClick={() => {
                        onAdd?.(curId);
                    }}
                >
                    Add
                </button>
            }
        </div>
        <ul className="flex flex-col gap-1">
            {
                uuids.map((id) => {
                    const assetInfo = assetInfos.find(e => e.uuid === id);
                    if(!assetInfo){
                        return <li key={id} className="text-yellow-500">missing: {id}</li>
                    }
                    return <li key={id} className="flex gap-1">
                        <button className="text-sm text-white py-1 px-2 bg-slate-600 hover:opacity-80
                            transition select-none cursor-pointer rounded"
                            onClick={() => {
                                onRemove?.(assetInfo.uuid, assetInfo);
                            }}
                        >
                            Remove
                        </button>
                        {assetInfo.name}
                    </li>
                })
            }
            
        </ul>
        <div className="w-full h-0.5 bg-slate-400"></div>
    </div>
}
export function AssetSelectionList(props: {
    label: string,
    uuidRefs: (string | undefined)[],
    type: AssetManager.AssetInfo["type"],
    onItemChange?: (index: number, uuidRef?: string) => void,
    onItemAdd?: () => void,
    onItemDelete?: (index: number) => void,
}){
    const { label, uuidRefs, type, onItemChange, onItemAdd, onItemDelete } = props;
    const [assetInfos, setAssetInfos] = useState<AssetManager.AssetInfo[]>([]);
    const [selectIndex, setSelectIndex] = useState(-1);
    
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const assetInfos = await window.api.assetManager.getAssetInfosFromType(type);
            if(cancelled) return;
            setAssetInfos(assetInfos);
        }
        load();
        return () => {
            cancelled = true;
        }
    }, [type]);
    const itemCreator = (uuidRef: string | undefined, index: number) => {
        return (
            <div className={`${index === selectIndex ? "bg-slate-400" : ""}`} key={index}
                onClick={() => {
                    setSelectIndex(index);
                }}>
                <Selection label={`Element ${index}`}
                    options={[
                        { label: "None", value: "" },
                        ...assetInfos.map(e => {
                            return {
                                label: e.name,
                                value: e.uuid
                            }
                        })
                    ]}
                    value={uuidRef || ""}
                    onChange={(value) => {
                        onItemChange?.(index, value || undefined);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <TextRow label={label} content=""/>
            <div className="flex flex-col bg-slate-600 rounded p-1">
                {
                    uuidRefs.map((uuidRef, index) => itemCreator(uuidRef, index))
                }
            </div>
            <div className="flex flex-row justify-end mr-2">
                <button className="size-5 bg-slate-600 cursor-pointer select-none
                    hover:bg-slate-400 transition-all
                    flex justify-center items-center"
                    onClick={() => {
                        onItemAdd?.();
                    }}>
                    <PlusIcon className="size-3 text-white"/>
                </button>
                {
                    selectIndex !== -1 &&
                    <button className="size-5 bg-slate-600 cursor-pointer select-none
                        hover:bg-slate-400 transition-all
                        flex justify-center items-center"
                        onClick={() => {
                            onItemDelete?.(selectIndex);
                            setSelectIndex(-1);
                        }}>
                        <MinusIcon className="size-3 text-white"/>
                    </button>
                }
            </div>
        </div>
    );
}
export function GameObjectSelectionList(props: {
    label: string,
    uuidRefs: (string | undefined)[],
    fiexed?: boolean,
    onItemChange?: (index: number, uuidRef?: string) => void,
    onItemAdd?: () => void,
    onItemDelete?: (index: number) => void,
}){
    const { label, uuidRefs, fiexed, onItemChange, onItemAdd, onItemDelete } = props;
    const nodes = useAppSelector(state => selectNodes(state));
    const [selectIndex, setSelectIndex] = useState(-1);

    const itemCreator = (uuidRef: string | undefined, index: number) => {
        return (
            <div className={`${index === selectIndex ? "bg-slate-400" : ""}`} key={index}
                onClick={() => {
                    setSelectIndex(index);
                }}>
                <Selection label={`Element ${index}`}
                    options={[
                        { label: "None", value: "" },
                        ...nodes.map(e => {
                            return {
                                label: e.name,
                                value: e.id
                            }
                        })
                    ]}
                    value={uuidRef || ""}
                    onChange={(value) => {
                        onItemChange?.(index, value || undefined);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <TextRow label={label} content=""/>
            <div className="flex flex-col bg-slate-600 rounded p-1">
                {
                    uuidRefs.map((uuidRef, index) => itemCreator(uuidRef, index))
                }
            </div>
            {
                !fiexed &&
                <div className="flex flex-row justify-end mr-2">
                    <button className="size-5 bg-slate-600 cursor-pointer select-none
                        hover:bg-slate-400 transition-all
                        flex justify-center items-center"
                        onClick={() => {
                            onItemAdd?.();
                        }}>
                        <PlusIcon className="size-3 text-white"/>
                    </button>
                    {
                        selectIndex !== -1 &&
                        <button className="size-5 bg-slate-600 cursor-pointer select-none
                            hover:bg-slate-400 transition-all
                            flex justify-center items-center"
                            onClick={() => {
                                onItemDelete?.(selectIndex);
                                setSelectIndex(-1);
                            }}>
                            <MinusIcon className="size-3 text-white"/>
                        </button>
                    }
                </div>
            }
        </div>
    );
}
