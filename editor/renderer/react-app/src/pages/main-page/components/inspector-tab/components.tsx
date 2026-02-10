import { useEffect, useState } from "react";
import { type JSX } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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
export function Selection<T extends number | string>(
    props: {
        label: string,
        value: T,
        options: { value: T, label: string }[],
        onChange: (value: T) => void
    }
){
    const { label, value, options, onChange } = props;
    return (
        <div className="flex items-center my-0.5">
            <span className="select-none text-sm text-white mr-1 w-24">{label}:</span>
            <div className="flex items-center w-full gap-1">
                <select className="cursor-pointer outline-none text-sm border"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value as T);
                    }}
                >
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
        onChange: (value: number) => void
    }
){
    const { label, value, onChange } = props;
    const [valueState, setValue] = useState(value.toString());
    const onBlurValue = () => {
        setValue(stringToNumber(valueState).toString());
        onChange(stringToNumber(valueState));
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
