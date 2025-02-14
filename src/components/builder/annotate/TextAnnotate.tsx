import { ResizeEnable } from "react-rnd";
import BaseAnnotate, { BaseAnnotateProps } from "./BaseAnnotate";

export type TextAnnotateFont = {
    name: "Arial" | "Khmer OS Siemreap";
    size: number;
    weight: number;
    color: string;
};

export type BaseTextAnnotate = {
    value: string;
    font: TextAnnotateFont;
};

export interface TextAnnotateProps
    extends Omit<BaseAnnotateProps, "children">,
        BaseTextAnnotate {}

export default function TextAnnotate({
    id,
    position,
    size,
    value,
    color,
    previewMode,
    font,
    resizable,
    selected,
    onDragStop,
    onResizeStop,
    onAnnotateSelect,
}: TextAnnotateProps) {
    return (
        <BaseAnnotate
            id={id}
            position={position}
            size={size}
            resizable={resizable}
            color={color}
            selected={selected}
            previewMode={previewMode}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onAnnotateSelect={onAnnotateSelect}
        >
            <span
                contentEditable={!previewMode}
                suppressContentEditableWarning
                id={`textAnnotate-${id}`}
                className={`text-center border-none bg-transparent outline-none resize-none`}
                style={{
                    fontFamily: font.name,
                    fontSize: `${font.size}px`,
                    fontWeight: font.weight,
                    color: font.color,
                    lineHeight: "1.2",
                }}
            >
                {value}
            </span>
        </BaseAnnotate>
    );
}
