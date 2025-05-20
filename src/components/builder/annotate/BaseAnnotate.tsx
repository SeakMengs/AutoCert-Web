// import { createScopedLogger } from "@/utils/logger";
import { memo, PropsWithChildren } from "react";
import { isHexColor } from "@/utils/color";
import Rnd, {
  RectPxAndPercent,
  RndProps,
  WHSize,
  XYPosition,
  XYPositionPxAndPercent,
} from "../rnd/Rnd";
import { cn } from "@/utils";
import { ProjectRole } from "@/types/project";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { AnnotateColor } from "../store/autocertAnnotate";

// const logger = createScopedLogger("components:builder:annotate:BaseAnnotate");

export interface BaseAnnotateProps
  extends Pick<RndProps, "containerRef" | "lockResizeX" | "lockResizeY"> {
  id: string;
  x: XYPosition["x"];
  y: XYPosition["y"];
  width: WHSize["width"];
  height: WHSize["height"];
  selected: boolean;
  // When enable, annotate cannot be resized, dragged, or edited.
  previewMode: boolean;
  // Background and border color of the annotate
  color: string;
  zoomScale: number;
  pageNumber: number;
  // pdf page size which will be used to convert percentage of resized page to actual page size
  pageOriginalSize: WHSize;
  roles: ProjectRole[];
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
  x,
  y,
  width,
  height,
  children,
  roles,
  previewMode,
  selected,
  color,
  containerRef,
  lockResizeX,
  lockResizeY,
  zoomScale,
  // pdf page size which will be used to convert percentage of resized page to actual page size
  pageOriginalSize,
  // zoomScale,
  pageNumber,
  onDragStop,
  onResizeStop,
  onAnnotateSelect,
}: PropsWithChildren<BaseAnnotateProps>) {
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

  const canUpdate = hasPermission(roles, [
    ProjectPermission.AnnotateSignatureUpdate,
    ProjectPermission.AnnotateColumnUpdate,
  ]);

  const enableDragging = !previewMode && canUpdate;
  const enableResizing = !previewMode && canUpdate;
  const showResizeHandle = selected && !previewMode && canUpdate;

  return (
    <Rnd
      originalSize={pageOriginalSize}
      size={{
        width: width,
        height: height,
      }}
      position={{
        x: x,
        y: y,
      }}
      scale={zoomScale}
      showResizeHandle={showResizeHandle}
      onDragStart={(e) => {
        onAnnotateSelectWithStopPropagation(id, e);
      }}
      onResizeStart={(e) => {
        onAnnotateSelectWithStopPropagation(id, e);
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      enableDragging={enableDragging}
      enableResizing={enableResizing}
      lockResizeX={lockResizeX}
      lockResizeY={lockResizeY}
      containerRef={containerRef}
      dragClassName={cn({
        "z-20": selected,
        "z-10": !selected,
      })}
    >
      <div
        onClick={handleClick}
        className="relative rounded w-full h-full cursor-move"
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
