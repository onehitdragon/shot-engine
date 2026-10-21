import type { TextAssetInspector } from "../../../../global-state/slices/inspector-slice";
import { List } from "react-window";
import { type RowComponentProps } from "react-window";

export function TextAssetInspector(props: { inspector: TextAssetInspector }){
    const { textAsset } = props.inspector;
    const { text } = textAsset;
    const lines = text.split("\n");
    return (
        <List rowComponent={TextRow}
            rowCount={lines.length}
            rowProps={{ lines: lines }}
            rowHeight={25}
            className="scrollbar-thin"
        />
    );
}
function TextRow(
    { index, lines, style }: RowComponentProps<{lines: string[]}>
){
    return <p style={style} className="text-white text-sm whitespace-nowrap">
        {lines[index]}
    </p>
}
