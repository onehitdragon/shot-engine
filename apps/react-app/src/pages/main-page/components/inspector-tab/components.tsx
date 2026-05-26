import { useEffect, useRef, useState } from "react";
import { type JSX } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { clamp } from "lodash";

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
