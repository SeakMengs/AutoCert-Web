import { cn } from "@/utils";
import { RndProps } from "./Rnd";
import { memo } from "react";

export interface ResizeProps
  extends Pick<
    RndProps,
    "enableResizing" | "showResizeHandle" | "resizeClassName" | "resizeStyle"
  > {
  onResizePointerDown: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => void;
}

function ResizeHandle({
  enableResizing,
  showResizeHandle,
  resizeClassName,
  resizeStyle,
  onResizePointerDown,
}: ResizeProps) {
  return (
    <>
      {enableResizing && showResizeHandle && (
        <div
          className={cn(
            "autocert-resize-handle",
            resizeClassName,
            "rounded-full -bottom-1 border-gray-400 bg-white shadow-md border absolute cursor-nwse-resize",
          )}
          onMouseDown={onResizePointerDown}
          onTouchStart={onResizePointerDown}
          style={{
            ...resizeStyle,
            position: "absolute",
            width: "8px",
            height: "8px",
            right: -4,
            bottom: 0,
            cursor: "se-resize",
          }}
        />
      )}
    </>
  );
}

export default memo(ResizeHandle);
