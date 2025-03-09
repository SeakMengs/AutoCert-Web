import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Rnd, {
  RndProps,
  XYPositionPxAndPercent,
  WHSizePxAndPercent,
  RectPxAndPercent,
} from "@/components/builder/rnd/Rnd";
import { createRef } from "react";

describe("Rnd Component", () => {
  const defaultProps = {
    position: { x: 100, y: 100 },
    size: { width: 200, height: 200 },
    originalSize: { width: 1000, height: 1000 },
    containerRef: createRef<HTMLDivElement>(),
    showResizeHandle: true,
    enableDragging: true,
    enableResizing: true,
  } satisfies RndProps;

  beforeEach(() => {
    // Mock HTMLElement.clientWidth/clientHeight which are not available in JSDOM
    Object.defineProperties(HTMLElement.prototype, {
      clientWidth: {
        configurable: true,
        value: 1000,
      },
      clientHeight: {
        configurable: true,
        value: 1000,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the component with default props", () => {
    const { container } = render(
      <Rnd {...defaultProps}>
        <div data-testid="child-element">Content</div>
      </Rnd>,
    );

    expect(screen.getByTestId("child-element")).not.toBeNull();
    expect(container.querySelector(".autocert-drag")).not.toBeNull();
    expect(container.querySelector(".autocert-resize-handle")).not.toBeNull();
  });

  it("applies custom class names", () => {
    const { container } = render(
      <Rnd
        {...defaultProps}
        dragClassName="custom-drag-class"
        resizeClassName="custom-resize-class"
      >
        <div>Content</div>
      </Rnd>,
    );

    expect(container.querySelector(".custom-drag-class")?.className).toContain(
      "custom-drag-class",
    );
    expect(
      container.querySelector(".custom-resize-class")?.className,
    ).toContain("custom-resize-class");
  });

  it("doesn't render the resize handle when showResizeHandle is false", () => {
    const { container } = render(
      <Rnd {...defaultProps} showResizeHandle={false}>
        <div>Content</div>
      </Rnd>,
    );

    expect(container.querySelector(".autocert-resize-handle")).toBeNull();
  });

  it("calls onDragStart when dragging begins", async () => {
    const onDragStartMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onDragStart={onDragStartMock}>
        <div>Content</div>
      </Rnd>,
    );

    const dragElement = container.querySelector(".autocert-drag");
    fireEvent.mouseDown(dragElement!, { clientX: 150, clientY: 150 });

    expect(onDragStartMock).toHaveBeenCalledTimes(1);
    const dragPosition: XYPositionPxAndPercent = {
      xPercent: 10,
      yPercent: 10,
      x: 100,
      y: 100,
    };
    expect(onDragStartMock.mock.calls[0][1]).toMatchObject(dragPosition);
  });

  it("calls onDrag when dragging", async () => {
    const onDragMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onDrag={onDragMock}>
        <div>Content</div>
      </Rnd>,
    );

    const dragElement = container.querySelector(".autocert-drag");
    fireEvent.mouseDown(dragElement!, { clientX: 150, clientY: 150 });

    // Simulate mouse movement
    fireEvent.mouseMove(window, { clientX: 250, clientY: 250 });

    expect(onDragMock).toHaveBeenCalled();

    // Cleanup
    fireEvent.mouseUp(window);
  });

  it("calls onDragStop when dragging stops", async () => {
    const onDragStopMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onDragStop={onDragStopMock}>
        <div>Content</div>
      </Rnd>,
    );

    const dragElement = container.querySelector(".autocert-drag");
    fireEvent.mouseDown(dragElement!, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(window, { clientX: 250, clientY: 250 });
    fireEvent.mouseUp(window);

    expect(onDragStopMock).toHaveBeenCalledTimes(1);
  });

  it("calls onResizeStart when resizing begins", () => {
    const onResizeStartMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onResizeStart={onResizeStartMock}>
        <div>Content</div>
      </Rnd>,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });

    expect(onResizeStartMock).toHaveBeenCalledTimes(1);
  });

  it("calls onResize when resizing", () => {
    const onResizeMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onResize={onResizeMock}>
        <div>Content</div>
      </Rnd>,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(window, { clientX: 400, clientY: 400 });

    expect(onResizeMock).toHaveBeenCalled();

    // Cleanup
    fireEvent.mouseUp(window);
  });

  it("calls onResizeStop when resizing stops", () => {
    const onResizeStopMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onResizeStop={onResizeStopMock}>
        <div>Content</div>
      </Rnd>,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(window, { clientX: 400, clientY: 400 });
    fireEvent.mouseUp(window);

    expect(onResizeStopMock).toHaveBeenCalledTimes(1);
  });

  it("respects minWidth and minHeight constraints", () => {
    const onResizeMock = vi.fn();
    const { container } = render(
      <Rnd
        {...defaultProps}
        minWidth={100}
        minHeight={100}
        onResize={onResizeMock}
      >
        <div>Content</div>
      </Rnd>,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });

    expect(onResizeMock).toHaveBeenCalled();
    const lastCall =
      onResizeMock.mock.calls[onResizeMock.mock.calls.length - 1];
    const lastResizeData = lastCall[1] as RectPxAndPercent;

    // Min width/height should be 10% (100px / 1000px * 100)
    expect(lastResizeData.widthPercent).toBeGreaterThanOrEqual(10);
    expect(lastResizeData.heightPercent).toBeGreaterThanOrEqual(10);

    // Cleanup
    fireEvent.mouseUp(window);
  });

  it("respects lockResizeX constraint", () => {
    const onResizeMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} lockResizeX={true} onResize={onResizeMock}>
        <div>Content</div>
      </Rnd>,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(window, { clientX: 400, clientY: 400 });

    const lastCall =
      onResizeMock.mock.calls[onResizeMock.mock.calls.length - 1];
    const resizeData: WHSizePxAndPercent = lastCall[1];
    expect(resizeData.widthPercent).toBe(20); // Should remain at initial 20%

    // Cleanup
    fireEvent.mouseUp(window);
  });

  it("respects lockResizeY constraint", () => {
    const onResizeMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} lockResizeY={true} onResize={onResizeMock}>
        <div>Content</div>
      </Rnd>,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(window, { clientX: 400, clientY: 400 });

    const lastCall =
      onResizeMock.mock.calls[onResizeMock.mock.calls.length - 1];
    const resizeData: WHSizePxAndPercent = lastCall[1];
    expect(resizeData.heightPercent).toBe(20); // Should remain at initial 20%

    // Cleanup
    fireEvent.mouseUp(window);
  });

  it("handles touch events for dragging", () => {
    const onDragMock = vi.fn();
    const { container } = render(
      <Rnd {...defaultProps} onDrag={onDragMock}>
        <div>Content</div>
      </Rnd>,
    );

    const dragElement = container.querySelector(".autocert-drag");

    // Create touch event
    const touchStartEvent = new TouchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
      touches: [
        {
          identifier: 0,
          target: dragElement as EventTarget,
          clientX: 150,
          clientY: 150,
        } as any,
      ],
    });

    // Dispatch touch events
    dragElement!.dispatchEvent(touchStartEvent);

    // Simulate touch movement
    const touchMoveEvent = new TouchEvent("touchmove", {
      bubbles: true,
      cancelable: true,
      touches: [
        {
          identifier: 0,
          target: window as unknown as EventTarget,
          clientX: 250,
          clientY: 250,
        } as any,
      ],
    });

    window.dispatchEvent(touchMoveEvent);

    // Complete touch sequence
    window.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
  });
});
