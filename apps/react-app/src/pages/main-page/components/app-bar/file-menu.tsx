import { useEffect, useRef, useState } from "react"

type FileMenuProps = {
    items: Omit<MenuItemProps, "click" | "highlighted" | "hover" | "ref">[]
}
type MenuItemProps = {
    label: string,
    options: MenuOptionItemProps[],
    highlighted: boolean | null,
    click: () => void,
    hover: () => void
}
type MenuOptionsProps = {
    options: MenuOptionItemProps[],
}
type MenuOptionItemProps = {
    optionLabel: string,
    shortcutLabel: string,
    click: () => void
}
export function FileMenu(props: FileMenuProps){
    const { items } = props;
    const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
    const menuButtonsRef = useRef<HTMLUListElement>(null);
    const menuItemClick = (index: number) => {
        if(highlightIdx === null) setHighlightIdx(index);
        else setHighlightIdx(null);
    }
    const menuItemHover = (index: number) => {
        if(highlightIdx !== null) setHighlightIdx(index);
    }
    useEffect(() => {
        const handler = (e: PointerEvent) => {
            const target = e.target as HTMLElement | null;
            const wraper = menuButtonsRef.current;
            if(!target || !wraper) return;
            if(!wraper.contains(target) || target.id != "in-wraper"){
                setHighlightIdx(null);
            }
        }
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    return (
        <ul ref={menuButtonsRef} className='flex'>
            {
                items.map(
                    ({ label, options }, index) => 
                    <MenuItem
                        key={index}
                        label={label}
                        options={options}
                        highlighted={highlightIdx == null ? null : highlightIdx == index}
                        click={() => menuItemClick(index)}
                        hover={() => menuItemHover(index)}
                    />
                )
            }
        </ul>
    );
}
function MenuItem(props: MenuItemProps){
    const { label, options, highlighted, click, hover } = props;
    return (
        <div className='relative'>
            <button id="in-wraper" className={`px-2 py-1 rounded-md flex transition duration-200
                ${highlighted ? "bg-gray-500" : "hover:bg-gray-500"}`}
                onClick={click}
                onMouseEnter={hover}
            >
                <span id="in-wraper" className='text-white text-xs'>{label}</span>
            </button>
            {
                highlighted
                &&
                <MenuOptions options={options}/>
            }
        </div>
    );
}
function MenuOptions(props: MenuOptionsProps){
    const { options } = props;
    return (
        <ul className='absolute top-full left-0 flex flex-col p-1 rounded-md bg-gray-700 border border-gray-600
            w-60'>
            {
                options.map(
                    ({ optionLabel, shortcutLabel, click }, index) => 
                    <MenuOptionItem
                        key={index}
                        optionLabel={optionLabel}
                        shortcutLabel={shortcutLabel}
                        click={click}
                    />
                )
            }
        </ul>
    );
}
function MenuOptionItem(props: MenuOptionItemProps){
    const { optionLabel, shortcutLabel, click } = props;
    return (
        <button className='flex-1 flex justify-between px-5 py-1 hover:cursor-pointer hover:bg-blue-500 rounded-sm
            transition duration-200' onClick={click}>
            <span className='text-white text-xs'>{optionLabel}</span>
            <span className='text-white text-xs'>{shortcutLabel}</span>
        </button>
    );
}
