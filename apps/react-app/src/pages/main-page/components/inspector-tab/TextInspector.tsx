import type { TextInspector } from "../../../../global-state/slices/inspector-slice";
import { List } from "react-window";
import { type RowComponentProps } from "react-window";

export function TextInspector(props: { textInspector: TextInspector }){
    const { content } = props.textInspector;
    const lines = content.split("\n");
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
