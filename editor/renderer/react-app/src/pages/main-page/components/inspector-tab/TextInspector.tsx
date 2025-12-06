import type { TextInspector } from "../../../../global-state/slices/inspector-slice";

export function TextInspector(props: { textInspector: TextInspector }){
    const { content } = props.textInspector;
    return (
        <div className="p-1 overflow-auto scrollbar-thin text-white text-sm">
            {content}
        </div>
    );
}