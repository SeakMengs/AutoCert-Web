import useAutoCert from "@/components/builder/hooks/useAutoCert";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextAnnotateFormSchema } from "@/components/builder/panel/tool/text/AutoCertTextTool";
import { AutoCertTableColumn } from "@/components/builder/panel/table/AutoCertTable";
import { WHSize, XYPosition } from "@/components/builder/annotate/BaseAnnotate";
import { SignatureAnnotateFormSchema } from "@/components/builder/panel/tool/signatory/AutoCertSignatoryTool";

describe("useAutoCert", () => {
  const initialPdfPage = 1;

  // Mock necessary objects for PDF.js
  const mockDocument = {
    numPages: 3,
    getPage: vi.fn().mockImplementation(() => ({
      view: [0, 0, 595, 842], // A4 size in points
    })),
  };

  const mockPage = {
    originalWidth: 595,
    originalHeight: 842,
    width: 595,
    height: 842,
  };

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    expect(result.current.currentPdfPage).toBe(initialPdfPage);
    expect(result.current.totalPdfPage).toBe(0);
    expect(result.current.pagesScale).toEqual({});
    expect(result.current.annotates).toEqual({});
    expect(result.current.textAnnotates).toEqual({});
    expect(result.current.signatureAnnotates).toEqual({});
    expect(result.current.zoomScale).toBe(1);
    expect(result.current.selectedAnnotateId).toBe(undefined);
  });

  it("should handle document load success", async () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    await act(async () => {
      await result.current.onDocumentLoadSuccess(mockDocument as any);
    });

    expect(result.current.totalPdfPage).toBe(3);
    expect(result.current.currentPdfPage).toBe(initialPdfPage);
  });

  it("should handle page click", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    act(() => {
      result.current.onPageClick(2);
    });

    expect(result.current.currentPdfPage).toBe(2);
  });

  it("should add a text annotate", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData = {
      value: "Test Text",
      fontName: "Arial",
      color: "#FF0000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.textAnnotates[initialPdfPage]).toHaveLength(1);

    const textAnnotate = result.current.annotates[initialPdfPage][0];
    expect(textAnnotate.type).toBe("text");

    if (textAnnotate.type !== "text") {
      throw new Error("Text annotate type is not 'text'");
    }

    expect(textAnnotate.value).toBe(textAnnotateData.value);
    expect(textAnnotate.color).toBe(textAnnotateData.color);
    expect(textAnnotate.font.name).toBe(textAnnotateData.fontName);
  });

  it("should add a signature annotate", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    const data = {
      email: "test@autocert.com",
    } satisfies SignatureAnnotateFormSchema;

    act(() => {
      result.current.onSignatureAnnotateAdd(initialPdfPage, data);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.signatureAnnotates[initialPdfPage]).toHaveLength(1);

    const signatureAnnotate = result.current.annotates[initialPdfPage][0];
    expect(signatureAnnotate.type).toBe("signature");

    if (signatureAnnotate.type !== "signature") {
      throw new Error("Signature annotate type is not 'signature'");
    }

    expect(signatureAnnotate.email).toBe(data.email);
  });

  it("Should add a signature annotate and invite", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    const data = {
      email: "test@autocert.com",
    } satisfies SignatureAnnotateFormSchema;

    act(() => {
      result.current.onSignatureAnnotateAdd(initialPdfPage, data);
    });
    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.signatureAnnotates[initialPdfPage]).toHaveLength(1);
    const signatureAnnotate = result.current.annotates[initialPdfPage][0];
    expect(signatureAnnotate.type).toBe("signature");

    if (signatureAnnotate.type !== "signature") {
      throw new Error("Signature annotate type is not 'signature'");
    }

    expect(signatureAnnotate.email).toBe(data.email);
    act(() => {
      result.current.onSignatureAnnotateInvite(signatureAnnotate.id);
    });
    expect(result.current.signatureAnnotates[initialPdfPage][0].status).toBe(
      "invited",
    );
  });

  it("should remove a signature annotate", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const data = {
      email: "test@autocert.com",
    } satisfies SignatureAnnotateFormSchema;
    act(() => {
      result.current.onSignatureAnnotateAdd(initialPdfPage, data);
    });
    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.signatureAnnotates[initialPdfPage]).toHaveLength(1);
    const signatureId = result.current.annotates[initialPdfPage][0].id;

    act(() => {
      result.current.onSignatureAnnotateRemove(signatureId);
    });
    expect(result.current.annotates[initialPdfPage]).toHaveLength(0);
    expect(result.current.signatureAnnotates[initialPdfPage]).toBeUndefined();
  });

  it("should update a text annotate", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData = {
      value: "Original Text",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;
    const updatedTextAnnotateData = {
      value: "Updated Text",
      fontName: "Helvetica",
      color: "#FF0000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateUpdate(textId, updatedTextAnnotateData);
    });

    const updatedTextAnnotate = result.current.annotates[initialPdfPage][0];
    expect(updatedTextAnnotate.type).toBe("text");

    if (updatedTextAnnotate.type !== "text") {
      throw new Error("Text annotate type is not 'text'");
    }

    expect(updatedTextAnnotate.value).toBe(updatedTextAnnotateData.value);
    expect(updatedTextAnnotate.color).toBe(updatedTextAnnotateData.color);
    expect(updatedTextAnnotate.font.name).toBe(
      updatedTextAnnotateData.fontName,
    );
  });

  it("should delete a text annotate", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData = {
      value: "To Be Deleted",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;

    act(() => {
      result.current.onTextAnnotateRemove(textId);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(0);
    expect(result.current.textAnnotates[initialPdfPage]).toBeUndefined();
  });

  it("should handle annotation selection", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData = {
      value: "Select Me",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;

    act(() => {
      result.current.onAnnotateSelect(textId);
    });

    expect(result.current.selectedAnnotateId).toBe(textId);

    act(() => {
      result.current.onAnnotateSelect(undefined);
    });

    expect(result.current.selectedAnnotateId).toBeUndefined();
  });

  it("should handle annotation drag", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData: TextAnnotateFormSchema = {
      value: "Drag Me",
      fontName: "Arial",
      color: "#000000",
    };

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;
    const newPosition = { x: 100, y: 200 } satisfies XYPosition;

    act(() => {
      result.current.onAnnotateDragStop(
        textId,
        null,
        newPosition,
        initialPdfPage,
      );
    });

    const updatedAnnotate = result.current.annotates[initialPdfPage][0];

    expect(updatedAnnotate.position).toEqual(newPosition);
  });

  it("should handle annotation resize", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData = {
      value: "Resize Me",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;
    const newSize = { width: 200, height: 50 } satisfies WHSize;
    const newPosition = { x: 50, y: 100 } satisfies XYPosition;

    act(() => {
      result.current.onAnnotateResizeStop(
        textId,
        newSize,
        newPosition,
        initialPdfPage,
      );
    });

    const updatedAnnotate = result.current.annotates[initialPdfPage][0];

    expect(updatedAnnotate.size).toEqual(newSize);
    expect(updatedAnnotate.position).toEqual(newPosition);
  });

  it("should update scale for a page", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    act(() => {
      result.current.onScaleChange(0.75, initialPdfPage);
    });

    expect(result.current.pagesScale[initialPdfPage]).toBe(0.75);
  });

  it("should update zoom scale", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    act(() => {
      result.current.onZoomScaleChange(1.5);
    });
    expect(result.current.zoomScale).toBe(1.5);

    act(() => {
      result.current.onZoomScaleChange(1);
    });
    expect(result.current.zoomScale).toBe(1);
  });

  it("should update column titles in annotations", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textAnnotateData = {
      value: "OldTitle",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextAnnotateFormSchema;

    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, textAnnotateData);
    });

    act(() => {
      result.current.onColumnTitleChange("OldTitle", "NewTitle");
    });

    const updatedAnnotate = result.current.annotates[initialPdfPage][0];

    if (updatedAnnotate.type !== "text") {
      throw new Error("Text annotate type is not 'text'");
    }

    expect(updatedAnnotate.value).toBe("NewTitle");
  });

  it("should remove unnecessary annotations", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    // Add a text annotate that will be kept
    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, {
        value: "KeepThis",
        fontName: "Arial",
        color: "#000000",
      });
    });

    // Add another text annotate that will be removed
    act(() => {
      result.current.onTextAnnotateAdd(initialPdfPage, {
        value: "RemoveThis",
        fontName: "Arial",
        color: "#000000",
      });
    });

    const columns = [
      { title: "KeepThis", dataIndex: "keepThis", editable: true },
    ] satisfies AutoCertTableColumn[];

    act(() => {
      result.current.removeUnnecessaryAnnotates(columns);
    });

    const annotates = result.current.annotates[initialPdfPage];

    expect(annotates).toHaveLength(1);

    if (annotates[0].type !== "text") {
      throw new Error("Text annotate type is not 'text'");
    }

    expect(annotates[0].value).toBe("KeepThis");
    expect(result.current.textAnnotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.signatureAnnotates[initialPdfPage]).toBeUndefined();
  });
});
