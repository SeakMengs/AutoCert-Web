// import { createScopedLogger } from "@/utils/logger";
import { memo } from "react";
import { AnnotateColor } from "../hooks/useAutoCert";
import { isHexColor } from "@/utils/color";
import Rnd, {
  RectPxAndPercent,
  RndProps,
  WHSize,
  XYPosition,
  XYPositionPxAndPercent,
} from "../rnd/Rnd";

// const logger = createScopedLogger("components:builder:annotate:BaseAnnotate");

export interface BaseAnnotateProps
  extends Pick<RndProps, "containerRef" | "lockResizeX" | "lockResizeY"> {
  id: string;
  position: XYPosition;
  size: WHSize;
  selected: boolean;
  // When enable, annotate cannot be resized, dragged, or edited.
  previewMode: boolean;
  children: React.ReactNode;
  // Background and border color of the annotate
  color: string;
  zoomScale: number;
  pageNumber: number;
  // pdf page size which will be used to convert percentage of resized page to actual page size
  pageOriginalSize: WHSize;
  onAnnotateSelect: (id: string | undefined) => void;
  onDragStop: (
    id: string,
    e: MouseEvent,
    position: XYPositionPxAndPercent,
    pageNumber: number,
  ) => void;
  onResizeStop: (
    id: string,
    e: MouseEvent,
    rect: RectPxAndPercent,
    pageNumber: number,
  ) => void;
}

function BaseAnnotate({
  id,
  position,
  size,
  children,
  previewMode,
  selected,
  color,
  containerRef,
  lockResizeX,
  lockResizeY,
  // pdf page size which will be used to convert percentage of resized page to actual page size
  pageOriginalSize,
  zoomScale,
  pageNumber,
  onDragStop,
  onResizeStop,
  onAnnotateSelect,
}: BaseAnnotateProps) {
  const deZoomScale = 1;

  const bgColor = isHexColor(color) ? color : AnnotateColor;

  const onAnnotateSelectWithStopPropagation = (
    annotateId: string,
    e: MouseEvent,
  ) => {
    if (e) {
      // Prevent the event from propagating to the parent element
      e.preventDefault();
      e.stopPropagation();
    }

    if (previewMode) {
      // If preview mode is enabled, do not select the annotate
      return;
    }

    onAnnotateSelect(annotateId);
  };

  const handleDragStop: RndProps["onDragStop"] = (e, position) => {
    onAnnotateSelectWithStopPropagation(id, e);
    if (onDragStop) {
      onDragStop(id, e, position, pageNumber);
    }
  };

  const handleResizeStop: RndProps["onResizeStop"] = (e, rect) => {
    onAnnotateSelectWithStopPropagation(id, e);
    if (onResizeStop) {
      onResizeStop(id, e, rect, pageNumber);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    onAnnotateSelectWithStopPropagation(id, e as unknown as MouseEvent);
  };

  return (
    <Rnd
      originalSize={pageOriginalSize}
      size={size}
      position={position}
      showResizeHandle={selected}
      onDragStart={(e) => {
        onAnnotateSelectWithStopPropagation(id, e);
      }}
      onResizeStart={(e) => {
        onAnnotateSelectWithStopPropagation(id, e);
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      enableDragging={!previewMode}
      enableResizing={!previewMode}
      lockResizeX={lockResizeX}
      lockResizeY={lockResizeY}
      containerRef={containerRef}
    >
      <div
        onClick={handleClick}
        className="relative z-19 rounded cursor-text w-full h-full"
        style={{
          border: selected ? `1px solid ${bgColor}` : `1px solid transparent`,
        }}
      >
        <div
          className="absolute inset-0 rounded z-0 opacity-[0.4]"
          style={{
            backgroundColor: previewMode ? "transparent" : bgColor,
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
