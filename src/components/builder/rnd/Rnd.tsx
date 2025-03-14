import {
  useState,
  useEffect,
  PropsWithChildren,
  HTMLAttributes,
  memo,
} from "react";
import { cn } from "@/utils";
import ResizeHandle, { ResizeProps } from "./ResizeHandle";

export type XYPosition = {
  x: number;
  y: number;
};
export type XYPositionPercent = {
  xPercent: number;
  yPercent: number;
};
export type XYPositionPxAndPercent = XYPosition & XYPositionPercent;

export type WHSize = {
  width: number;
  height: number;
};
export type WHSizePercent = {
  widthPercent: number;
  heightPercent: number;
};
export type WHSizePxAndPercent = WHSize & WHSizePercent;

export type Rect = XYPosition & WHSize;
export type RectPercent = XYPositionPercent & WHSizePercent;
export type RectPxAndPercent = XYPositionPxAndPercent & WHSizePxAndPercent;

export interface RndProps {
  // Initial values in pixels
  position: XYPosition;
  size: WHSize;
  // Current transformed scale (to ensure moving and resizing works correctly)
  scale: number;
  minWidth?: number;
  minHeight?: number;
  // The design reference container size in px which will be used to convert percentage of resized component to actual position and size
  originalSize: WHSize;
  // the parent container that wraps the component, will be used to calculate the percentage of the component, if omitted, will use the viewport size
  containerRef: React.RefObject<HTMLDivElement | HTMLElement | null>;
  showResizeHandle: boolean;
  lockResizeX?: boolean;
  lockResizeY?: boolean;
  dragStyle?: React.CSSProperties;
  resizeStyle?: React.CSSProperties;
  dragClassName?: HTMLAttributes<HTMLDivElement>["className"];
  resizeClassName?: HTMLAttributes<HTMLDivElement>["className"];
  enableDragging?: boolean;
  enableResizing?: boolean;
  onDragStart?: (e: MouseEvent, position: XYPositionPxAndPercent) => void;
  onDrag?: (e: MouseEvent, position: XYPositionPxAndPercent) => void;
  onDragStop?: (e: MouseEvent, position: XYPositionPxAndPercent) => void;
  onResizeStart?: (e: MouseEvent, rect: RectPxAndPercent) => void;
  onResize?: (e: MouseEvent, rect: RectPxAndPercent) => void;
  onResizeStop?: (e: MouseEvent, rect: RectPxAndPercent) => void;
}

function Rnd({
  position,
  size,
  scale = 1,
  minHeight = 0,
  minWidth = 0,
  originalSize,
  containerRef,
  dragStyle,
  resizeStyle,
  dragClassName,
  resizeClassName,
  lockResizeX = false,
  lockResizeY = false,
  showResizeHandle = true,
  enableDragging = true,
  enableResizing = true,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop,
  children,
}: PropsWithChildren<RndProps>) {
  // Convert px values into percentages.
  const initialXPercent = (position.x / originalSize.width) * 100;
  const initialYPercent = (position.y / originalSize.height) * 100;
  const initialWidthPercent = (size.width / originalSize.width) * 100;
  const initialHeightPercent = (size.height / originalSize.height) * 100;

  // Convert min dimensions from design px to percentage.
  const minWidthPercent =
    minWidth !== undefined ? (minWidth / originalSize.width) * 100 : undefined;
  const minHeightPercent =
    minHeight !== undefined
      ? (minHeight / originalSize.height) * 100
      : undefined;

  // Rect as percentage values.
  const [rect, setRect] = useState<RectPercent>({
    xPercent: initialXPercent,
    yPercent: initialYPercent,
    widthPercent: initialWidthPercent,
    heightPercent: initialHeightPercent,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  // Mouse position in pixels.
  const [startMouse, setStartMouse] = useState<XYPosition | null>(null);
  // Rect as percentage values.
  const [startRect, setStartRect] = useState<RectPercent | null>(null);

  // Get container dimensions (responsive container or fallback to viewport, when use viewport, dragging and resizing will feel slow or buggy)
  const getContainerDimensions = () => {
    if (containerRef && containerRef.current) {
      return {
        width: containerRef.current.clientWidth * scale,
        height: containerRef.current.clientHeight * scale,
      };
    }

    return {
      width: document.documentElement.clientWidth * scale,
      height: document.documentElement.clientHeight * scale,
    };
  };

  const getEventClientPosition = (
    e:
      | MouseEvent
      | TouchEvent
      | React.MouseEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>,
  ): {
    clientX: number;
    clientY: number;
  } => {
    if ("clientX" in e) {
      return { clientX: e.clientX, clientY: e.clientY };
    }

    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }

    return { clientX: 0, clientY: 0 };
  };

  // Convert percentage values back to pixels based on original size.
  const convertToPx = ({
    xPercent,
    yPercent,
    widthPercent,
    heightPercent,
  }: RectPercent): Rect => {
    return {
      x: (xPercent / 100) * originalSize.width,
      y: (yPercent / 100) * originalSize.height,
      width: (widthPercent / 100) * originalSize.width,
      height: (heightPercent / 100) * originalSize.height,
    };
  };

  // Handle mouse/touch movement for dragging and resizing.
  const onPointerMove = (e: MouseEvent | TouchEvent): void => {
    if (!startMouse || !startRect) return;
    const { width: containerWidth, height: containerHeight } =
      getContainerDimensions();

    const { clientX, clientY } = getEventClientPosition(e);
    // Calculate the difference between the current mouse position and the starting mouse position.
    const deltaX = clientX - startMouse.x;
    const deltaY = clientY - startMouse.y;

    if (isDragging) {
      // Compute delta as percentage of container dimensions.
      const deltaXPercent = (deltaX / containerWidth) * 100;
      const deltaYPercent = (deltaY / containerHeight) * 100;
      let newXPercent = startRect.xPercent + deltaXPercent;
      let newYPercent = startRect.yPercent + deltaYPercent;

      /**
       * Clamp so the element remains within the container.
       * Example: If the container is 100x100 (percentage), and the element is 20x20:
       * The maximum X position allowed is 100 - 20 = 80
       * The maximum Y position allowed is 100 - 20 = 80
       **/
      newXPercent = Math.max(
        0,
        Math.min(newXPercent, 100 - startRect.widthPercent),
      );
      newYPercent = Math.max(
        0,
        Math.min(newYPercent, 100 - startRect.heightPercent),
      );

      setRect(
        (prev) =>
          ({
            ...prev,
            xPercent: newXPercent,
            yPercent: newYPercent,
          }) satisfies RectPercent,
      );

      if (onDrag) {
        const conv = convertToPx({
          xPercent: newXPercent,
          yPercent: newYPercent,
          widthPercent: startRect.widthPercent,
          heightPercent: startRect.heightPercent,
        });
        onDrag(e as unknown as MouseEvent, {
          xPercent: newXPercent,
          yPercent: newYPercent,
          x: conv.x,
          y: conv.y,
        });
      }
    } else if (isResizing) {
      // Compute width/height change in percentage.
      const deltaWidthPercent = lockResizeX
        ? 0
        : (deltaX / containerWidth) * 100;
      const deltaHeightPercent = lockResizeY
        ? 0
        : (deltaY / containerHeight) * 100;
      let newWidthPercent = startRect.widthPercent + deltaWidthPercent;
      let newHeightPercent = startRect.heightPercent + deltaHeightPercent;

      // Apply minimum constraints if provided.
      if (minWidthPercent !== undefined)
        newWidthPercent = Math.max(newWidthPercent, minWidthPercent);
      if (minHeightPercent !== undefined)
        newHeightPercent = Math.max(newHeightPercent, minHeightPercent);

      // Ensure the element does not exceed container bounds.
      newWidthPercent = Math.min(newWidthPercent, 100 - startRect.xPercent);
      newHeightPercent = Math.min(newHeightPercent, 100 - startRect.yPercent);
      setRect(
        (prev) =>
          ({
            ...prev,
            widthPercent: newWidthPercent,
            heightPercent: newHeightPercent,
          }) satisfies RectPercent,
      );
      if (onResize) {
        // When resizing from the bottom-right, position (x,y) remains unchanged.
        const conv = convertToPx({
          xPercent: startRect.xPercent,
          yPercent: startRect.yPercent,
          widthPercent: newWidthPercent,
          heightPercent: newHeightPercent,
        });
        onResize(e as unknown as MouseEvent, {
          widthPercent: newWidthPercent,
          heightPercent: newHeightPercent,
          xPercent: startRect.xPercent,
          yPercent: startRect.yPercent,
          width: conv.width,
          height: conv.height,
          x: conv.x,
          y: conv.y,
        });
      }
    }
  };

  // Stop dragging or resizing when the mouse/touch is released.
  const onPointerUp = (e: MouseEvent | TouchEvent): void => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragStop) {
        const conv = convertToPx(rect);
        onDragStop(e as unknown as MouseEvent, {
          xPercent: rect.xPercent,
          yPercent: rect.yPercent,
          x: conv.x,
          y: conv.y,
        });
      }
    }
    if (isResizing) {
      setIsResizing(false);
      if (onResizeStop) {
        const conv = convertToPx(rect);
        onResizeStop(e as unknown as MouseEvent, {
          widthPercent: rect.widthPercent,
          heightPercent: rect.heightPercent,
          xPercent: rect.xPercent,
          yPercent: rect.yPercent,
          width: conv.width,
          height: conv.height,
          x: conv.x,
          y: conv.y,
        });
      }
    }
    setStartMouse(null);
    setStartRect(null);
  };

  // Start dragging when clicking/touching outside the resize handle.
  const onDragPointerDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ): void => {
    if (!enableDragging) {
      return;
    }

    const target = e.target as HTMLElement;
    if (target.classList.contains("autocert-resize-handle")) {
      return;
    }

    const { clientX, clientY } = getEventClientPosition(e);

    setIsDragging(true);
    setStartMouse({ x: clientX, y: clientY } satisfies XYPosition);
    setStartRect(rect);

    if (onDragStart) {
      const conv = convertToPx(rect);
      onDragStart(e as unknown as MouseEvent, {
        xPercent: rect.xPercent,
        yPercent: rect.yPercent,
        x: conv.x,
        y: conv.y,
      });
    }

    e.preventDefault();
    e.stopPropagation();
  };

  // Start resizing when clicking the resize handle.
  const onResizePointerDown: ResizeProps["onResizePointerDown"] = (e) => {
    if (!enableResizing) {
      return;
    }

    const { clientX, clientY } = getEventClientPosition(e);

    setIsResizing(true);
    setStartMouse({ x: clientX, y: clientY });
    setStartRect(rect);
    if (onResizeStart) {
      const conv = convertToPx(rect);
      onResizeStart(e as unknown as MouseEvent, {
        widthPercent: rect.widthPercent,
        heightPercent: rect.heightPercent,
        xPercent: rect.xPercent,
        yPercent: rect.yPercent,
        width: conv.width,
        height: conv.height,
        x: conv.x,
        y: conv.y,
      });
    }
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", onPointerUp);
      window.addEventListener("mouseleave", onPointerUp);
      window.addEventListener("touchmove", onPointerMove, { passive: false });
      window.addEventListener("touchend", onPointerUp);
      window.addEventListener("touchcancel", onPointerUp);
    } else {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("mouseleave", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("touchcancel", onPointerUp);
    }
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("mouseleave", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("touchcancel", onPointerUp);
    };
  }, [isDragging, isResizing, startMouse, startRect, rect]);

  return (
    <div
      className={cn("autocert-drag", dragClassName)}
      onMouseDown={onDragPointerDown}
      onTouchStart={onDragPointerDown}
      style={{
        ...dragStyle,
        position: "absolute",
        left: `${rect.xPercent}%`,
        top: `${rect.yPercent}%`,
        width: `${rect.widthPercent}%`,
        height: `${rect.heightPercent}%`,
        boxSizing: "border-box",
        // Prevent text selection while dragging
        userSelect: "none",
        // Prevent default touch actions like scrolling
        touchAction: "none",
      }}
    >
      {children}
      {/*  resize handle */}
      <ResizeHandle
        onResizePointerDown={onResizePointerDown}
        showResizeHandle={showResizeHandle}
        enableResizing={enableResizing}
        resizeClassName={resizeClassName}
        resizeStyle={resizeStyle}
      />
    </div>
  );
}

export default memo(Rnd);
