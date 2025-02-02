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

export type BaseAnnotateProps = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    resizable?: ResizeEnable | undefined;
    children: React.ReactNode;
    bgColor: string;
    onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
    onResizeStop: (
        id: string,
        numberSize: WHSize,
        position: XYPosition
    ) => void;
};

export default function BaseAnnotate({
    id,
    x,
    y,
    width,
    height,
    children,
    resizable,
    bgColor,
    onDragStop,
    onResizeStop,
}: BaseAnnotateProps) {
    return (
        <Rnd
            size={{ width, height }}
            position={{ x, y }}
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
            enableResizing={resizable}
            bounds="parent"
        >
            <div
                className="relative rounded cursor-text w-full h-full"
                style={{
                    border: `1px solid ${bgColor}`,
                }}
            >
                <div
                    className="absolute inset-0 rounded z-0 opacity-[0.6]"
                    style={{
                        backgroundColor: bgColor,
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