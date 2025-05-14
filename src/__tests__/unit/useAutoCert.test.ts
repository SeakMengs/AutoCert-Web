import useAutoCert, {
  AutoCertSettings,
} from "@/components/builder/hooks/useAutoCert";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProjectRole } from "@/types/project";

const testSettings = {
  qrCodeEnabled: false,
} satisfies AutoCertSettings;

const UseAutoCertParams = {
  projectId: "test-project-id",
  initialPdfPage: 1,
  csvFileUrl: "",
  initialSettings: testSettings,
  enqueueChange: vi.fn(),
  initialAnnotates: {},
  initialRoles: [ProjectRole.Requestor],
  saveChanges: vi.fn(),
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
    const { result } = renderHook(() => useAutoCert(UseAutoCertParams));

    expect(result.current.currentPdfPage).toBe(initialPdfPage);
    expect(result.current.totalPdfPage).toBe(0);
    expect(result.current.zoomScale).toBe(1);
  });

  it("should handle document load success", async () => {
    const { result } = renderHook(() => useAutoCert(UseAutoCertParams));

    await act(async () => {
      await result.current.onDocumentLoadSuccess(mockDocument as any);
    });

    expect(result.current.totalPdfPage).toBe(3);
    expect(result.current.currentPdfPage).toBe(initialPdfPage);
  });

  it("should handle page click", () => {
    const { result } = renderHook(() => useAutoCert(UseAutoCertParams));

    act(() => {
      result.current.onPageClick(2);
    });

    expect(result.current.currentPdfPage).toBe(2);
  });

  it("should update zoom scale", () => {
    const { result } = renderHook(() => useAutoCert(UseAutoCertParams));

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
