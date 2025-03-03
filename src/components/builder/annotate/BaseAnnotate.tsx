// import { createScopedLogger } from "@/utils/logger";
import { MouseEvent } from "react";
import { DraggableEvent, DraggableData } from "react-draggable";
import { ResizeEnable, Rnd } from "react-rnd";

// const logger = createScopedLogger("components:builder:annotate:BaseAnnotate");

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
    selected: boolean;
    // When enable, annotate cannot be resized, dragged, or edited.
    previewMode: boolean;
    resizable?: ResizeEnable | undefined;
    children: React.ReactNode;
    // Background and border color of the annotate
    color: string;
    scale: number;
    zoomScale: number;
    pageNumber: number;
    onDragStop: (
        id: string,
        e: DraggableEvent,
        data: DraggableData,
        pageNumber: number
    ) => void;
    onResizeStop: (
        id: string,
        numberSize: WHSize,
        position: XYPosition,
        pageNumber: number
    ) => void;
    onAnnotateSelect: (id: string | undefined) => void;
}

export default function BaseAnnotate({
    id,
    position,
    size,
    children,
    previewMode,
    resizable,
    selected,
    color,
    scale,
    zoomScale,
    pageNumber,
    onDragStop,
    onResizeStop,
    onAnnotateSelect,
}: BaseAnnotateProps) {
    const onAnnotateSelectWithStopPropagation = (
        id: string | undefined,
        e: MouseEvent<Element> | DraggableEvent
    ) => {
        // Prevent the event from propagating to the parent element
        e.preventDefault();
        e.stopPropagation();
        onAnnotateSelect(id);
    };

    return (
        <Rnd
            // identifier for on select parent element (in AnnotateRenderer div onClick)
            className="annotation-rnd"
            scale={zoomScale}
            size={{
                // ...size,
                // apply de-zoom scale since we already apply canvas scale
                width: (size.width * scale) / zoomScale,
                height: (size.height * scale) / zoomScale,
            }}
            position={{
                // ...position,
                x: (position.x * scale) / zoomScale,
                y: (position.y * scale) / zoomScale,
            }}
            onDragStart={(_e, _data) => {
                onAnnotateSelectWithStopPropagation(id, _e);
            }}
            onDragStop={(_e, position) => {
                onAnnotateSelectWithStopPropagation(id, _e);
                onDragStop(
                    id,
                    _e,
                    {
                        ...position,
                        x: (position.x / scale) * zoomScale,
                        y: (position.y / scale) * zoomScale,
                    },
                    pageNumber
                );
            }}
            onResizeStart={(_e) => {
                onAnnotateSelectWithStopPropagation(id, _e);
            }}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
                onResizeStop(
                    id,
                    {
                        width:
                            (Number(ref.style.width.replace("px", "")) /
                                scale) *
                            zoomScale,
                        height:
                            (Number(ref.style.height.replace("px", "")) /
                                scale) *
                            zoomScale,
                    },
                    {
                        x: (position.x / scale) * zoomScale,
                        y: (position.y / scale) * zoomScale,
                    },
                    pageNumber
                );
            }}
            disableDragging={previewMode}
            enableResizing={previewMode ? false : resizable}
            bounds="parent"
        >
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => {
                    onAnnotateSelectWithStopPropagation(id, e);
                }}
                className="relative z-20 rounded cursor-text w-full h-full"
                style={{
                    border: selected
                        ? `1px solid ${color}`
                        : `1px solid transparent`,
                }}
            >
                <div
                    className="absolute inset-0 rounded z-0 opacity-[0.4]"
                    style={{
                        backgroundColor: previewMode ? "transparent" : color,
                    }}
                ></div>
                <div className="relative flex items-center justify-center w-full h-full">
                    {children}
                </div>
            </div>
        </Rnd>
    );
}
