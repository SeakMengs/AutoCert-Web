import { DraggableEvent, DraggableData } from "react-draggable";
import { ResizeEnable, Rnd } from "react-rnd";

export type XYPosition = {
    x: number;
    y: number;
};

export type WHSize = {
    width: number;
    height: number;
};

export interface BaseAnnotateProps {
    id: string;
    position: XYPosition;
    size: WHSize;
    // When enable, annotate cannot be resized, dragged, or edited.
    previewMode: boolean;
    resizable?: ResizeEnable | undefined;
    children: React.ReactNode;
    // Background and border color of the annotate
    color: string;
    onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
    onResizeStop: (
        id: string,
        numberSize: WHSize,
        position: XYPosition
    ) => void;
}

export default function BaseAnnotate({
    id,
    position,
    size,
    children,
    previewMode,
    resizable,
    color,
    onDragStop,
    onResizeStop,
}: BaseAnnotateProps) {
    return (
        <Rnd
            size={size}
            position={position}
            onDragStop={(_e, position) => onDragStop(id, _e, position)}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
                onResizeStop(
                    id,
                    {
                        width: Number(ref.style.width.replace("px", "")),
                        height: Number(ref.style.height.replace("px", "")),
                    },
                    {
                        x: position.x,
                        y: position.y,
                    }
                );
            }}
            disableDragging={previewMode}
            enableResizing={previewMode ? false : resizable}
            bounds="parent"
        >
            <div
                className="relative rounded cursor-text w-full h-full"
                style={{
                    border: previewMode ? "" : `2px dashed ${color}`,
                }}
            >
                <div
                    className="absolute inset-0 rounded z-0 opacity-[0.4]"
                    style={{
                        backgroundColor: previewMode ? "transparent" : color,
                    }}
                ></div>
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                    {children}
                    <div />
                </div>
            </div>
        </Rnd>
    );
}
