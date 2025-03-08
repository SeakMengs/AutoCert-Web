import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import ResizeHandle, {
  ResizeProps,
} from "@/components/builder/rnd/ResizeHandle";

describe("ResizeHandle Component", () => {
  const defaultProps = {
    enableResizing: true,
    showResizeHandle: true,
    onResizePointerDown: vi.fn(),
    resizeClassName: undefined,
    resizeStyle: undefined,
  } satisfies ResizeProps;

  it("renders correctly with default props", () => {
    const { container } = render(<ResizeHandle {...defaultProps} />);

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    expect(resizeHandle).not.toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ResizeHandle {...defaultProps} resizeClassName="custom-resize-class" />,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    expect(resizeHandle?.className).toContain("custom-resize-class");
  });

  it("applies custom style", () => {
    const customStyle: React.CSSProperties = {
      backgroundColor: "rgb(255, 0, 0)",
      borderRadius: "10px",
    };

    const { container } = render(
      <ResizeHandle {...defaultProps} resizeStyle={customStyle} />,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    const computedStyle = getComputedStyle(resizeHandle!);
    expect(computedStyle.backgroundColor).toBe(customStyle.backgroundColor);
    expect(computedStyle.borderRadius).toBe(customStyle.borderRadius);
  });

  it("doesn't render when showResizeHandle is false", () => {
    const { container } = render(
      <ResizeHandle {...defaultProps} showResizeHandle={false} />,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    expect(resizeHandle).toBeNull();
  });

  it("doesn't render when enableResizing is false", () => {
    const { container } = render(
      <ResizeHandle {...defaultProps} enableResizing={false} />,
    );

    const resizeHandle = container.querySelector(".auto-cert-resize-handle");
    expect(resizeHandle).toBeNull();
  });

  it("calls onResizePointerDown when mouse down event is triggered", () => {
    const onResizePointerDown = vi.fn();
    const { container } = render(
      <ResizeHandle
        {...defaultProps}
        onResizePointerDown={onResizePointerDown}
      />,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    fireEvent.mouseDown(resizeHandle!, { clientX: 300, clientY: 300 });

    expect(onResizePointerDown).toHaveBeenCalledTimes(1);
  });

  it("calls onResizePointerDown with properly typed event", () => {
    const onResizePointerDown = vi.fn();
    const { container } = render(
      <ResizeHandle
        {...defaultProps}
        onResizePointerDown={onResizePointerDown}
      />,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");
    const mouseEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      clientX: 300,
      clientY: 300,
    });

    resizeHandle!.dispatchEvent(mouseEvent);

    expect(onResizePointerDown).toHaveBeenCalled();
    // Verify the event parameter is correctly typed
    expect(onResizePointerDown.mock.calls[0][0]).toBeTruthy();
  });

  it("calls onResizePointerDown when touch start event is triggered", () => {
    const onResizePointerDown = vi.fn();
    const { container } = render(
      <ResizeHandle
        {...defaultProps}
        onResizePointerDown={onResizePointerDown}
      />,
    );

    const resizeHandle = container.querySelector(".autocert-resize-handle");

    // Create touch event
    const touchStartEvent = new TouchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
      touches: [
        {
          identifier: 0,
          target: resizeHandle as EventTarget,
          clientX: 300,
          clientY: 300,
        } as any,
      ],
    });

    resizeHandle!.dispatchEvent(touchStartEvent);

    expect(onResizePointerDown).toHaveBeenCalled();
  });
});
