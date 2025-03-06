"use client";
// import { createScopedLogger } from "@/utils/logger";
import {
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DraggableEvent, DraggableData } from "react-draggable";
import { ResizeEnable, Rnd, RndResizeCallback } from "react-rnd";
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
    position: XYPosition,
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
  const deZoomScale = useMemo(() => {
    return scale / zoomScale;
  }, [scale, zoomScale]);

  const scaledSize = useMemo(() => {
    return {
      width: size.width * deZoomScale,
      height: size.height * deZoomScale,
    };
  }, [size, deZoomScale]);

  const scaledPosition = useMemo(() => {
    return {
      x: position.x * deZoomScale,
      y: position.y * deZoomScale,
    };
  }, [position, deZoomScale]);

  const displayColor = isHexColor(color) ? color : AnnotateColor;

  const onAnnotateSelectWithStopPropagation = (
    annotateId: string | undefined,
    e: MouseEvent<Element> | DraggableEvent,
  ) => {
    // Prevent the event from propagating to the parent element
    e.preventDefault();
    e.stopPropagation();
    onAnnotateSelect(annotateId);
  };

  const handleDragStop = (_e: DraggableEvent, dragPosition: DraggableData) => {
    onAnnotateSelectWithStopPropagation(id, _e);
    onDragStop(
      id,
      _e,
      {
        x: dragPosition.x / deZoomScale,
        y: dragPosition.y / deZoomScale,
      },
      pageNumber,
    );
  };

  const handleResizeStop: RndResizeCallback = (
    _e,
    dir,
    elementRef,
    delta,
    position,
  ) => {
    onResizeStop(
      id,
      {
        width: Number(elementRef.style.width.replace("px", "")) / deZoomScale,
        height: Number(elementRef.style.height.replace("px", "")) / deZoomScale,
      },
      {
        x: position.x / deZoomScale,
        y: position.y / deZoomScale,
      },
      pageNumber,
    );
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    onAnnotateSelectWithStopPropagation(id, e);
  };

  return (
    <Rnd
      className="annotation-rnd"
      scale={zoomScale}
      size={scaledSize}
      position={scaledPosition}
      onDragStart={(e) => onAnnotateSelectWithStopPropagation(id, e)}
      onDragStop={handleDragStop}
      onResizeStart={(e) => onAnnotateSelectWithStopPropagation(id, e)}
      onResizeStop={handleResizeStop}
      disableDragging={previewMode}
      enableResizing={previewMode ? false : resizable}
      bounds="parent"
    >
      <div
        onClick={handleClick}
        className="relative z-20 rounded cursor-text w-full h-full"
        style={{
          border: selected
            ? `1px solid ${displayColor}`
            : `1px solid transparent`,
        }}
      >
        <div
          className="absolute inset-0 rounded z-0 opacity-[0.4]"
          style={{
            backgroundColor: previewMode ? "transparent" : displayColor,
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
