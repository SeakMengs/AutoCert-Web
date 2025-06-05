// import { createScopedLogger } from "@/utils/logger";
import { CSSProperties, memo, PropsWithChildren } from "react";
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

export const AnnotateColor = "#FFC4C4";

// const logger = createScopedLogger("components:builder:annotate:BaseAnnotate");
export type BaseAnnotateLock = {
  resize: boolean;
  drag: boolean;
  update: boolean;
  remove: boolean;
  disable: boolean;
  showBg: boolean;
};

export interface BaseAnnotateProps
  extends Pick<RndProps, "containerRef" | "lockResizeX" | "lockResizeY"> {
  id: string;
  x: XYPosition["x"];
  y: XYPosition["y"];
  width: WHSize["width"];
  height: WHSize["height"];
  selected: boolean;
  lock: BaseAnnotateLock;
  // Background and border color of the annotate
  color: string;
  zoomScale: number;
  pageNumber: number;
  // pdf page size which will be used to convert percentage of resized page to actual page size
  pageOriginalSize: WHSize;
  roles: ProjectRole[];
  style?: CSSProperties;
  onAnnotateSelect: (id: string | undefined) => void;
  onDragStart: (
    id: string,
    e: MouseEvent,
    position: XYPositionPxAndPercent,
    pageNumber: number,
  ) => void;
  onDragStop: (
    id: string,
    e: MouseEvent,
    position: XYPositionPxAndPercent,
    pageNumber: number,
  ) => void;
  onResizeStart: (
    id: string,
    e: MouseEvent,
    rect: RectPxAndPercent,
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
  lock,
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
  style,
  onDragStart,
  onDragStop,
  onResizeStart,
  onResizeStop,
  onAnnotateSelect,
}: PropsWithChildren<BaseAnnotateProps>) {
  const bgColor = isHexColor(color) ? color : AnnotateColor;

  const canUpdate = hasPermission(roles, [
    ProjectPermission.AnnotateSignatureUpdate,
    ProjectPermission.AnnotateColumnUpdate,
  ]);

  const enableDragging = !lock.disable && lock.drag && canUpdate;
  const enableResizing = !lock.disable && lock.resize && canUpdate;
  const showResizeHandle =
    !lock.disable && selected && lock.resize && canUpdate;

  const onAnnotateSelectWithStopPropagation = (
    annotateId: string,
    e: MouseEvent,
  ) => {
    if (e) {
      // Prevent the event from propagating to the parent element
      e.preventDefault();
      e.stopPropagation();
    }

    onAnnotateSelect(annotateId);
  };

  const handleDragStart: RndProps["onDragStart"] = (e, position) => {
    onAnnotateSelectWithStopPropagation(id, e);
    if (onDragStart) {
      onDragStart(id, e as unknown as MouseEvent, position, pageNumber);
    }
  };

  const handleDragStop: RndProps["onDragStop"] = (e, position) => {
    onAnnotateSelectWithStopPropagation(id, e);
    if (onDragStop) {
      onDragStop(id, e, position, pageNumber);
    }
  };

  const handleResizeStart: RndProps["onResizeStart"] = (e, rect) => {
    onAnnotateSelectWithStopPropagation(id, e);
    if (onResizeStart) {
      onResizeStart(id, e as unknown as MouseEvent, rect, pageNumber);
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
      onDragStart={handleDragStart}
      onResizeStart={handleResizeStart}
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
        className={cn("relative rounded w-full h-full", {
          "cursor-auto": lock.disable || !canUpdate,
          "cursor-move": enableDragging,
        })}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor:
            selected && lock.showBg && !lock.disable ? bgColor : "transparent",
          ...style,
        }}
      >
        <div
          className="absolute inset-0 rounded z-0 opacity-[0.4]"
          style={{
            backgroundColor:
              lock.showBg && !lock.disable ? bgColor : "transparent",
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
