import useAutoCert from "@/components/builder/hooks/useAutoCert";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextFieldSchema } from "@/components/builder/panel/tool/text/AutoCertTextTool";
import { AutoCertTableColumn } from "@/components/builder/panel/table/AutoCertTable";
import { WHSize, XYPosition } from "@/components/builder/annotate/BaseAnnotate";

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
    expect(result.current.textAnnotates).toEqual([]);
    expect(result.current.signatureAnnotates).toEqual([]);
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

  it("should add a text field", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textFieldData = {
      value: "Test Text",
      fontName: "Arial",
      color: "#FF0000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.textAnnotates).toHaveLength(1);

    const textAnnotate = result.current.annotates[initialPdfPage][0];
    expect(textAnnotate.type).toBe("text");

    if (textAnnotate.type !== "text") {
      throw new Error("Text annotate type is not 'text'");
    }

    expect(textAnnotate.value).toBe(textFieldData.value);
    expect(textAnnotate.color).toBe(textFieldData.color);
    expect(textAnnotate.font.name).toBe(textFieldData.fontName);
  });

  it("should add a signature field", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));

    act(() => {
      result.current.onAddSignatureField();
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.signatureAnnotates).toHaveLength(1);

    const signatureAnnotate = result.current.annotates[initialPdfPage][0];
    expect(signatureAnnotate.type).toBe("signature");
  });

  it("should update a text field", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textFieldData = {
      value: "Original Text",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;
    const updatedTextFieldData = {
      value: "Updated Text",
      fontName: "Helvetica",
      color: "#FF0000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onUpdateTextField(textId, updatedTextFieldData);
    });

    const updatedTextAnnotate = result.current.annotates[initialPdfPage][0];
    expect(updatedTextAnnotate.type).toBe("text");

    if (updatedTextAnnotate.type !== "text") {
      throw new Error("Text annotate type is not 'text'");
    }

    expect(updatedTextAnnotate.value).toBe(updatedTextFieldData.value);
    expect(updatedTextAnnotate.color).toBe(updatedTextFieldData.color);
    expect(updatedTextAnnotate.font.name).toBe(updatedTextFieldData.fontName);
  });

  it("should delete a text field", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textFieldData = {
      value: "To Be Deleted",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
    });

    const textId = result.current.annotates[initialPdfPage][0].id;

    act(() => {
      result.current.onDeleteTextField(textId);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(0);
    expect(result.current.textAnnotates).toHaveLength(0);
  });

  it("should handle annotation selection", () => {
    const { result } = renderHook(() => useAutoCert({ initialPdfPage }));
    const textFieldData = {
      value: "Select Me",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
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
    const textFieldData: TextFieldSchema = {
      value: "Drag Me",
      fontName: "Arial",
      color: "#000000",
    };

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
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
    const textFieldData = {
      value: "Resize Me",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
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
    const textFieldData = {
      value: "OldTitle",
      fontName: "Arial",
      color: "#000000",
    } satisfies TextFieldSchema;

    act(() => {
      result.current.onAddTextField(initialPdfPage, textFieldData);
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

    // Add a text field that will be kept
    act(() => {
      result.current.onAddTextField(initialPdfPage, {
        value: "KeepThis",
        fontName: "Arial",
        color: "#000000",
      });
    });

    // Add another text field that will be removed
    act(() => {
      result.current.onAddTextField(initialPdfPage, {
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
    expect(result.current.textAnnotates).toHaveLength(1);
    expect(result.current.signatureAnnotates).toHaveLength(0);
  });
});
