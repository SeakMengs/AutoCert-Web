import useAutoCert, {
  AutoCertSettings,
} from "@/components/builder/hooks/useAutoCert";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProjectRole } from "@/types/project";
import { AnnotateStates } from "@/components/builder/hooks/useAutoCertAnnotate";
import { table } from "console";

const getUseAutoCertParams = () => {
  return {
    projectId: "test-project-id",
    initialPdfPage: 1,
    csvFileUrl: "",
    initialSettings: {
      qrCodeEnabled: false,
    } satisfies AutoCertSettings,
    enqueueChange: vi.fn(),
    initialAnnotates: {},
    roles: [ProjectRole.Requestor],
    saveChanges: vi.fn(),
  };
};

describe("useAutoCert", () => {
  const initialPdfPage = 1;

  // Mock necessary objects for PDF.js
  const mockDocument = {
    numPages: 3,
    getPage: vi.fn().mockImplementation(() => ({
      view: [0, 0, 595, 842], // A4 size in points
    })),
  };

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useAutoCert(getUseAutoCertParams()));

    expect(result.current.currentPdfPage).toBe(initialPdfPage);
    expect(result.current.totalPdfPage).toBe(0);
    expect(result.current.zoomScale).toBe(1);
  });

  it("should handle document load success", async () => {
    const { result } = renderHook(() => useAutoCert(getUseAutoCertParams()));

    await act(async () => {
      await result.current.onDocumentLoadSuccess(mockDocument as any);
    });

    expect(result.current.totalPdfPage).toBe(3);
    expect(result.current.currentPdfPage).toBe(initialPdfPage);
  });

  it("should handle page click", () => {
    const { result } = renderHook(() => useAutoCert(getUseAutoCertParams()));

    act(() => {
      result.current.onPageClick(2);
    });

    expect(result.current.currentPdfPage).toBe(2);
  });

  it("should update zoom scale", () => {
    const { result } = renderHook(() => useAutoCert(getUseAutoCertParams()));

    act(() => {
      result.current.onZoomScaleChange(1.5);
    });
    expect(result.current.zoomScale).toBe(1.5);

    act(() => {
      result.current.onZoomScaleChange(1);
    });
    expect(result.current.zoomScale).toBe(1);
  });
});
