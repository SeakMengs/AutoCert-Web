import { useState, useEffect, PropsWithChildren } from "react";
import { E } from "vitest/dist/chunks/reporters.Y8BYiXBN.js";

export type XYPosition = {
  x: number;
  y: number;
};

export type XYPositionPx = {
  xPx: number;
  yPx: number;
};

export type XYPositionPercent = {
  xPercent: number;
  yPercent: number;
};

export type WHSize = {
  width: number;
  height: number;
};

export type WHSizePx = {
  widthPx: number;
  heightPx: number;
};

export type WHSizePercent = {
  widthPercent: number;
  heightPercent: number;
};

export interface Rect extends XYPosition, WHSize {}

export interface RndProps {
  // Initial values in pixels
  position: XYPosition;
  size: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  // The design reference container size in px which will be used to convert percentage of resized component to actual position and size
  originalSize: { width: number; height: number };
  containerRef?: React.RefObject<HTMLElement>;
  dragStyle?: React.CSSProperties;
  resizeStyle?: React.CSSProperties;
  dragClassName?: string;
  resizeClassName?: string;
  enableDragging?: boolean;
  enableResizing?: boolean;
  onDragStart?: (
    e: MouseEvent,
    { xPercent, yPercent, xPx, yPx }: XYPositionPercent & XYPositionPx,
  ) => void;
  onDrag?: (
    e: MouseEvent,
    { xPercent, yPercent, xPx, yPx }: XYPositionPercent & XYPositionPx,
  ) => void;
  onDragStop?: (
    e: MouseEvent,
    { xPercent, yPercent, xPx, yPx }: XYPositionPercent & XYPositionPx,
  ) => void;
  onResizeStart?: (
    e: MouseEvent,
    {
      widthPercent,
      heightPercent,
      xPercent,
      yPercent,
      widthPx,
      heightPx,
      xPx,
      yPx,
    }: XYPositionPercent & XYPositionPx & WHSizePercent & WHSizePx,
  ) => void;
  onResize?: (
    e: MouseEvent,
    {
      widthPercent,
      heightPercent,
      xPercent,
      yPercent,
      widthPx,
      heightPx,
      xPx,
      yPx,
    }: XYPositionPercent & XYPositionPx & WHSizePercent & WHSizePx,
  ) => void;
  onResizeStop?: (
    e: MouseEvent,
    {
      widthPercent,
      heightPercent,
      xPercent,
      yPercent,
      widthPx,
      heightPx,
      xPx,
      yPx,
    }: XYPositionPercent & XYPositionPx & WHSizePercent & WHSizePx,
  ) => void;
}

export default function Rnd({
  position,
  size,
  minHeight = 0,
  minWidth = 0,
  originalSize,
  containerRef,
  dragStyle,
  resizeStyle,
  dragClassName,
  resizeClassName,
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

  const [rect, setRect] = useState<Rect>({
    x: initialXPercent,
    y: initialYPercent,
    width: initialWidthPercent,
    height: initialHeightPercent,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startMouse, setStartMouse] = useState<XYPosition | null>(null);
  const [startRect, setStartRect] = useState<Rect | null>(null);

  // Get container dimensions (responsive container or fallback to viewport)
  const getContainerDimensions = () => {
    if (containerRef && containerRef.current) {
      return {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      };
    }
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  };

  // Convert percentage values back to pixels based on original size.
  const convertToPx = (
    xPercent: number,
    yPercent: number,
    widthPercent: number,
    heightPercent: number,
  ) => {
    return {
      x: (xPercent / 100) * originalSize.width,
      y: (yPercent / 100) * originalSize.height,
      width: (widthPercent / 100) * originalSize.width,
      height: (heightPercent / 100) * originalSize.height,
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!startMouse || !startRect) return;
    const { width: containerWidth, height: containerHeight } =
      getContainerDimensions();
    const deltaX = e.clientX - startMouse.x;
    const deltaY = e.clientY - startMouse.y;

    if (isDragging) {
      // Compute delta as percentage of container dimensions.
      const deltaXPercent = (deltaX / containerWidth) * 100;
      const deltaYPercent = (deltaY / containerHeight) * 100;
      let newX = startRect.x + deltaXPercent;
      let newY = startRect.y + deltaYPercent;

      /**
       * Clamp so the element remains within the container.
       * Example: If the container is 100x100 (percentage), and the element is 20x20:
       * The maximum X position allowed is 100 - 20 = 80
       * The maximum Y position allowed is 100 - 20 = 80
       **/
      newX = Math.max(0, Math.min(newX, 100 - startRect.width));
      newY = Math.max(0, Math.min(newY, 100 - startRect.height));
      setRect((prev) => ({ ...prev, x: newX, y: newY }));
      if (onDrag) {
        const conv = convertToPx(newX, newY, startRect.width, startRect.height);
        onDrag(e, {
          xPercent: newX,
          yPercent: newY,
          xPx: conv.x,
          yPx: conv.y,
        });
      }
    } else if (isResizing) {
      // Compute width/height change in percentage.
      const deltaWidthPercent = (deltaX / containerWidth) * 100;
      const deltaHeightPercent = (deltaY / containerHeight) * 100;
      let newWidth = startRect.width + deltaWidthPercent;
      let newHeight = startRect.height + deltaHeightPercent;

      // Apply minimum constraints if provided.
      if (minWidthPercent !== undefined)
        newWidth = Math.max(newWidth, minWidthPercent);
      if (minHeightPercent !== undefined)
        newHeight = Math.max(newHeight, minHeightPercent);

      // Ensure the element does not exceed container bounds.
      newWidth = Math.min(newWidth, 100 - startRect.x);
      newHeight = Math.min(newHeight, 100 - startRect.y);
      setRect((prev) => ({ ...prev, width: newWidth, height: newHeight }));
      if (onResize) {
        // When resizing from the bottom-right, position (x,y) remains unchanged.
        const conv = convertToPx(startRect.x, startRect.y, newWidth, newHeight);
        onResize(e, {
          widthPercent: newWidth,
          heightPercent: newHeight,
          xPercent: startRect.x,
          yPercent: startRect.y,
          widthPx: conv.width,
          heightPx: conv.height,
          xPx: conv.x,
          yPx: conv.y,
        });
      }
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragStop) {
        const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
        onDragStop(e, {
          xPercent: rect.x,
          yPercent: rect.y,
          xPx: conv.x,
          yPx: conv.y,
        });
      }
    }
    if (isResizing) {
      setIsResizing(false);
      if (onResizeStop) {
        const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
        onResizeStop(e, {
          widthPercent: rect.width,
          heightPercent: rect.height,
          xPercent: rect.x,
          yPercent: rect.y,
          widthPx: conv.width,
          heightPx: conv.height,
          xPx: conv.x,
          yPx: conv.y,
        });
      }
    }
    setStartMouse(null);
    setStartRect(null);
  };

  // Start dragging when clicking outside the resize handle.
  const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableDragging) {
      return;
    }

    if (
      (e.target as HTMLElement).classList.contains("autocert-resize-handle")
    ) {
      return;
    }

    setIsDragging(true);
    setStartMouse({ x: e.clientX, y: e.clientY });
    setStartRect(rect);
    if (onDragStart) {
      const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
      onDragStart(e as unknown as MouseEvent, {
        xPercent: rect.x,
        yPercent: rect.y,
        xPx: conv.x,
        yPx: conv.y,
      });
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // Start resizing when clicking the resize handle.
  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableResizing) {
      return;
    }

    setIsResizing(true);
    setStartMouse({ x: e.clientX, y: e.clientY });
    setStartRect(rect);
    if (onResizeStart) {
      const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
      onResizeStart(e as unknown as MouseEvent, {
        widthPercent: rect.width,
        heightPercent: rect.height,
        xPercent: rect.x,
        yPercent: rect.y,
        widthPx: conv.width,
        heightPx: conv.height,
        xPx: conv.x,
        yPx: conv.y,
      });
    }
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, isResizing, startMouse, startRect, rect]);

  return (
    <div
      className={`autocert-drag` + (dragClassName ? ` ${dragClassName}` : "")}
      onMouseDown={onDragMouseDown}
      style={{
        ...dragStyle,
        position: "absolute",
        left: `${rect.x}%`,
        top: `${rect.y}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {children}
      {/* Bottom-right resize handle */}
      {enableResizing && (
        <div
          className={
            `autocert-resize-handle` +
            (resizeClassName ? ` ${resizeClassName}` : "") +
            "rounded-full -bottom-1 border-gray-400 bg-white shadow-md border absolute cursor-nwse-resize"
          }
          onMouseDown={onResizeMouseDown}
          style={{
            ...resizeStyle,
            position: "absolute",
            width: "8px",
            height: "8px",
            right: -4,
            bottom: 0,
            cursor: "se-resize",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />
      )}
    </div>
  );
}
