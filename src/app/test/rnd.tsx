// pages/index.tsx
"use client"
import React, { useState, useRef, useEffect } from 'react';

interface Rect {
  x: number; // in percentage
  y: number; // in percentage
  width: number; // in percentage
  height: number; // in percentage
}

interface RndProps {
  // Initial position and size in design pixels
  position: { x: number; y: number };
  size: { width: number; height: number };
  // Design reference container size in pixels
  originalSize: { width: number; height: number };
  // Optional minimum size (in design pixels)
  minWidth?: number;
  minHeight?: number;
  containerRef?: React.RefObject<HTMLElement>;
  // Drag events (values provided as percentages and pixels)
  onDragStart?: (xPercent: number, yPercent: number, xPx: number, yPx: number) => void;
  onDrag?: (xPercent: number, yPercent: number, xPx: number, yPx: number) => void;
  onDragStop?: (xPercent: number, yPercent: number, xPx: number, yPx: number) => void;
  // Resize events (first two parameters are width & height in %, then position in %, followed by px values)
  onResizeStart?: (
    widthPercent: number,
    heightPercent: number,
    xPercent: number,
    yPercent: number,
    widthPx: number,
    heightPx: number,
    xPx: number,
    yPx: number
  ) => void;
  onResize?: (
    widthPercent: number,
    heightPercent: number,
    xPercent: number,
    yPercent: number,
    widthPx: number,
    heightPx: number,
    xPx: number,
    yPx: number
  ) => void;
  onResizeStop?: (
    widthPercent: number,
    heightPercent: number,
    xPercent: number,
    yPercent: number,
    widthPx: number,
    heightPx: number,
    xPx: number,
    yPx: number
  ) => void;
  children?: React.ReactNode;
}

const Rnd: React.FC<RndProps> = ({
  position,
  size,
  originalSize,
  minWidth,
  minHeight,
  containerRef,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop,
  children,
}) => {
  // Convert initial design px values to percentages.
  const initialXPercent = (position.x / originalSize.width) * 100;
  const initialYPercent = (position.y / originalSize.height) * 100;
  const initialWidthPercent = (size.width / originalSize.width) * 100;
  const initialHeightPercent = (size.height / originalSize.height) * 100;

  // Convert min dimensions from design px to percentage.
  const minWidthPercent = minWidth !== undefined ? (minWidth / originalSize.width) * 100 : undefined;
  const minHeightPercent = minHeight !== undefined ? (minHeight / originalSize.height) * 100 : undefined;

  const [rect, setRect] = useState<Rect>({
    x: initialXPercent,
    y: initialYPercent,
    width: initialWidthPercent,
    height: initialHeightPercent,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startMouse, setStartMouse] = useState<{ x: number; y: number } | null>(null);
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

  // Convert percentage values back to design pixels.
  const convertToPx = (
    xPercent: number,
    yPercent: number,
    widthPercent: number,
    heightPercent: number
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
    const { width: containerWidth, height: containerHeight } = getContainerDimensions();
    const deltaX = e.clientX - startMouse.x;
    const deltaY = e.clientY - startMouse.y;

    if (isDragging) {
      const deltaXPercent = (deltaX / containerWidth) * 100;
      const deltaYPercent = (deltaY / containerHeight) * 100;
      let newX = startRect.x + deltaXPercent;
      let newY = startRect.y + deltaYPercent;
      // Clamp so the element stays within the container.
      newX = Math.max(0, Math.min(newX, 100 - startRect.width));
      newY = Math.max(0, Math.min(newY, 100 - startRect.height));
      setRect((prev) => ({ ...prev, x: newX, y: newY }));
      if (onDrag) {
        const conv = convertToPx(newX, newY, startRect.width, startRect.height);
        onDrag(newX, newY, conv.x, conv.y);
      }
    } else if (isResizing) {
      const deltaWidthPercent = (deltaX / containerWidth) * 100;
      const deltaHeightPercent = (deltaY / containerHeight) * 100;
      let newWidth = startRect.width + deltaWidthPercent;
      let newHeight = startRect.height + deltaHeightPercent;
      // Apply minimum constraints if provided.
      if (minWidthPercent !== undefined) newWidth = Math.max(newWidth, minWidthPercent);
      if (minHeightPercent !== undefined) newHeight = Math.max(newHeight, minHeightPercent);
      // Ensure the element remains within container bounds.
      newWidth = Math.min(newWidth, 100 - startRect.x);
      newHeight = Math.min(newHeight, 100 - startRect.y);
      setRect((prev) => ({ ...prev, width: newWidth, height: newHeight }));
      if (onResize) {
        const conv = convertToPx(startRect.x, startRect.y, newWidth, newHeight);
        onResize(newWidth, newHeight, startRect.x, startRect.y, conv.width, conv.height, conv.x, conv.y);
      }
    }
  };

  const onMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragStop) {
        const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
        onDragStop(rect.x, rect.y, conv.x, conv.y);
      }
    }
    if (isResizing) {
      setIsResizing(false);
      if (onResizeStop) {
        const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
        onResizeStop(rect.width, rect.height, rect.x, rect.y, conv.width, conv.height, conv.x, conv.y);
      }
    }
    setStartMouse(null);
    setStartRect(null);
  };

  // Start dragging (ignore clicks on the resize handle).
  const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    setIsDragging(true);
    setStartMouse({ x: e.clientX, y: e.clientY });
    setStartRect(rect);
    if (onDragStart) {
      const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
      onDragStart(rect.x, rect.y, conv.x, conv.y);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // Start resizing.
  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    setStartMouse({ x: e.clientX, y: e.clientY });
    setStartRect(rect);
    if (onResizeStart) {
      const conv = convertToPx(rect.x, rect.y, rect.width, rect.height);
      onResizeStart(rect.width, rect.height, rect.x, rect.y, conv.width, conv.height, conv.x, conv.y);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isResizing, startMouse, startRect, rect]);

  return (
    <div
      onMouseDown={onDragMouseDown}
      style={{
        position: 'absolute',
        left: `${rect.x}%`,
        top: `${rect.y}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {children}
      {/* Bottom-right resize handle */}
      <div
        className="resize-handle"
        onMouseDown={onResizeMouseDown}
        style={{
          position: 'absolute',
          width: '16px',
          height: '16px',
          right: 0,
          bottom: 0,
          cursor: 'se-resize',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
};

const Home: React.FC = () => {
  // Design reference size
  const originalSize = { width: 800, height: 600 };
  // Responsive container reference
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragInfo, setDragInfo] = useState('');
  const [resizeInfo, setResizeInfo] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h1>Responsive Rnd with Min Dimensions & Full Events</h1>
      {/* Responsive parent container with maintained aspect ratio */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '800px',
          aspectRatio: '4 / 3',
          margin: '0 auto',
          border: '2px solid #000',
        }}
      >
        <Rnd
          // Initial position and size in design pixels.
          position={{ x: 50, y: 50 }}
          size={{ width: 200, height: 150 }}
          originalSize={originalSize}
          // Provide minimum dimensions (in design pixels)
          minWidth={100}
          minHeight={80}
          containerRef={containerRef}
          onDragStart={(xPercent, yPercent, xPx, yPx) => {
            setDragInfo(`Drag Start: ${xPercent.toFixed(2)}% (${xPx.toFixed(0)}px), ${yPercent.toFixed(2)}% (${yPx.toFixed(0)}px)`);
          }}
          onDrag={(xPercent, yPercent, xPx, yPx) => {
            setDragInfo(`Dragging: ${xPercent.toFixed(2)}% (${xPx.toFixed(0)}px), ${yPercent.toFixed(2)}% (${yPx.toFixed(0)}px)`);
          }}
          onDragStop={(xPercent, yPercent, xPx, yPx) => {
            setDragInfo(`Drag Stop: ${xPercent.toFixed(2)}% (${xPx.toFixed(0)}px), ${yPercent.toFixed(2)}% (${yPx.toFixed(0)}px)`);
          }}
          onResizeStart={(widthPercent, heightPercent, xPercent, yPercent, widthPx, heightPx, xPx, yPx) => {
            setResizeInfo(
              `Resize Start: ${widthPercent.toFixed(2)}% (${widthPx.toFixed(0)}px) x ${heightPercent.toFixed(2)}% (${heightPx.toFixed(0)}px) at ${xPercent.toFixed(2)}% (${xPx.toFixed(0)}px), ${yPercent.toFixed(2)}% (${yPx.toFixed(0)}px)`
            );
          }}
          onResize={(widthPercent, heightPercent, xPercent, yPercent, widthPx, heightPx, xPx, yPx) => {
            setResizeInfo(
              `Resizing: ${widthPercent.toFixed(2)}% (${widthPx.toFixed(0)}px) x ${heightPercent.toFixed(2)}% (${heightPx.toFixed(0)}px) at ${xPercent.toFixed(2)}% (${xPx.toFixed(0)}px), ${yPercent.toFixed(2)}% (${yPx.toFixed(0)}px)`
            );
          }}
          onResizeStop={(widthPercent, heightPercent, xPercent, yPercent, widthPx, heightPx, xPx, yPx) => {
            setResizeInfo(
              `Resize Stop: ${widthPercent.toFixed(2)}% (${widthPx.toFixed(0)}px) x ${heightPercent.toFixed(2)}% (${heightPx.toFixed(0)}px) at ${xPercent.toFixed(2)}% (${xPx.toFixed(0)}px), ${yPercent.toFixed(2)}% (${yPx.toFixed(0)}px)`
            );
          }}
        >
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(100,150,200,0.5)' }}>
            Drag or Resize Me!
          </div>
        </Rnd>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>{dragInfo}</p>
        <p>{resizeInfo}</p>
      </div>
    </div>
  );
};

export default Home;
