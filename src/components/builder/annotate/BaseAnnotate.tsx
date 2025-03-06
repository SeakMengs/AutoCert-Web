// import { createScopedLogger } from "@/utils/logger";
import { memo, MouseEvent } from "react";
import { DraggableEvent, DraggableData } from "react-draggable";
import { ResizeEnable, Rnd } from "react-rnd";
import { AnnotateColor } from "../hooks/useAutoCert";
import { isHexColor } from "@/utils/color";

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
    pageNumber: number,
  ) => void;
  onResizeStop: (
    id: string,
    numberSize: WHSize,
    position: XYPosition,
    pageNumber: number,
  ) => void;
  onAnnotateSelect: (id: string | undefined) => void;
}

function BaseAnnotate({
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
    e: MouseEvent<Element> | DraggableEvent,
  ) => {
    // Prevent the event from propagating to the parent element
    e.preventDefault();
    e.stopPropagation();
    onAnnotateSelect(id);
  };

  const deZoomScale = scale / zoomScale;

  const scaledSize = {
    width: size.width * deZoomScale,
    height: size.height * deZoomScale,
  } satisfies WHSize;

  const scaledPosition = {
    x: position.x * deZoomScale,
    y: position.y * deZoomScale,
  } satisfies XYPosition;

  if (!isHexColor(color)) {
    color = AnnotateColor;
  }

  return (
    <Rnd
      // identifier for on select parent element (in AnnotateRenderer div onClick)
      className="annotation-rnd"
      scale={zoomScale}
      size={scaledSize}
      position={scaledPosition}
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
            x: position.x / deZoomScale,
            y: position.y / deZoomScale,
          },
          pageNumber,
        );
      }}
      onResizeStart={(_e) => {
        onAnnotateSelectWithStopPropagation(id, _e);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        onResizeStop(
          id,
          {
            width: Number(ref.style.width.replace("px", "")) / deZoomScale,
            height: Number(ref.style.height.replace("px", "")) / deZoomScale,
          },
          {
            x: position.x / deZoomScale,
            y: position.y / deZoomScale,
          },
          pageNumber,
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
          border: selected ? `1px solid ${color}` : `1px solid transparent`,
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

export default memo(BaseAnnotate);
