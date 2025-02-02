import { ResizeEnable } from "react-rnd";
import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";

export interface TextAnnotateProps extends Omit<BaseAnnotateProps, "children"> {
    value: string;
}

const TEXT_RESIZABLE = {
    bottom: false,
    bottomLeft: false,
    bottomRight: false,
    left: true,
    right: true,
    top: false,
    topLeft: false,
    topRight: false,
} satisfies ResizeEnable;

export default function TextAnnotate ({
    id,
    x,
    y,
    width,
    height,
    value,
    bgColor,
    resizable = TEXT_RESIZABLE,
    onDragStop,
    onResizeStop,
}: TextAnnotateProps) {
    return (
        <BaseAnnotate
            id={id}
            x={x}
            y={y}
            resizable={resizable}
            width={width}
            height={height}
            bgColor={bgColor}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
        >
            <span
                contentEditable
                suppressContentEditableWarning
                id={`textAnnotate-${id}`}
                className="text-[24px] text-center border-none bg-transparent outline-none resize-none font-normal"
                style={{
                    fontFamily: "Khmer OS Siemreap",
                    lineHeight: "1.2",
                }}
            >{value}</span>
        </BaseAnnotate>
    );
};