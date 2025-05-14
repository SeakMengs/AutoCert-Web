import useAutoCertAnnotate, {
  AnnotateColor,
  AnnotateStates,
} from "@/components/builder/hooks/useAutoCertAnnotate";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColumnAnnotateFormSchema } from "@/components/builder/panel/tool/column/ColumnTool";
import { AutoCertTableColumn } from "@/components/builder/panel/table/AutoCertTable";
import { SignatureAnnotateFormSchema } from "@/components/builder/panel/tool/signature/SignatureTool";
import {
  XYPositionPxAndPercent,
  RectPxAndPercent,
} from "@/components/builder/rnd/Rnd";
import { ProjectRole, SignatoryStatus } from "@/types/project";

const UseAutoCertAnnotateParams = {
  projectId: "test-project-id",
  enqueueChange: vi.fn(),
  initialAnnotates: {},
  roles: [ProjectRole.Requestor],
};

describe("useAutoCertAnnotate", () => {
  const initialPdfPage = 1;

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );

    expect(result.current.annotates).toEqual({});
    expect(result.current.columnAnnotates).toEqual({});
    expect(result.current.signatureAnnotates).toEqual({});
    expect(result.current.selectedAnnotateId).toBe(undefined);
  });

  it("should add a column annotate", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "Test Column",
      fontName: "Arial",
      color: "#FF0000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.columnAnnotates[initialPdfPage]).toHaveLength(1);

    const columnAnnotate = result.current.annotates[initialPdfPage][0];
    expect(columnAnnotate.type).toBe("column");

    if (columnAnnotate.type !== "column") {
      throw new Error("Column annotate type is not 'column'");
    }

    expect(columnAnnotate.value).toBe(columnAnnotateData.value);
    expect(columnAnnotate.color).toBe(columnAnnotateData.color);
    expect(columnAnnotate.fontName).toBe(columnAnnotateData.fontName);
    expect(columnAnnotate.textFitRectBox).toBe(
      columnAnnotateData.textFitRectBox,
    );
  });

  it("should add a signature annotate", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );

    const data = {
      email: "test@autocert.com",
      color: AnnotateColor,
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
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );

    const data = {
      email: "test@autocert.com",
      color: AnnotateColor,
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
      SignatoryStatus.Invited,
    );
  });

  it("should remove a signature annotate", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const data = {
      email: "test@autocert.com",
      color: AnnotateColor,
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

  it("should update a column annotate", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "Original Column",
      fontName: "Arial",
      color: "#000000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    const columnId = result.current.annotates[initialPdfPage][0].id;
    const updatedColumnAnnotateData = {
      value: "Updated Column",
      fontName: "Helvetica",
      color: "#FF0000",
      textFitRectBox: false,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateUpdate(
        columnId,
        updatedColumnAnnotateData,
      );
    });

    const updatedColumnAnnotate = result.current.annotates[initialPdfPage][0];
    expect(updatedColumnAnnotate.type).toBe("column");

    if (updatedColumnAnnotate.type !== "column") {
      throw new Error("Column annotate type is not 'column'");
    }

    expect(updatedColumnAnnotate.value).toBe(updatedColumnAnnotateData.value);
    expect(updatedColumnAnnotate.color).toBe(updatedColumnAnnotateData.color);
    expect(updatedColumnAnnotate.textFitRectBox).toBe(
      updatedColumnAnnotateData.textFitRectBox,
    );
    expect(updatedColumnAnnotate.fontName).toBe(
      updatedColumnAnnotateData.fontName,
    );
  });

  it("should delete a column annotate", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "To Be Deleted",
      fontName: "Arial",
      color: "#000000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    const columnId = result.current.annotates[initialPdfPage][0].id;

    act(() => {
      result.current.onColumnAnnotateRemove(columnId);
    });

    expect(result.current.annotates[initialPdfPage]).toHaveLength(0);
    expect(result.current.columnAnnotates[initialPdfPage]).toBeUndefined();
  });

  it("should handle annotation selection", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "Select Me",
      fontName: "Arial",
      color: "#000000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    const columnId = result.current.annotates[initialPdfPage][0].id;

    act(() => {
      result.current.onAnnotateSelect(columnId);
    });

    expect(result.current.selectedAnnotateId).toBe(columnId);

    act(() => {
      result.current.onAnnotateSelect(undefined);
    });

    expect(result.current.selectedAnnotateId).toBeUndefined();
  });

  it("should handle annotation drag", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "Drag Me",
      fontName: "Arial",
      color: "#000000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    const columnId = result.current.annotates[initialPdfPage][0].id;
    const newPosition = {
      xPercent: 10,
      yPercent: 10,
      x: 10,
      y: 10,
    } satisfies XYPositionPxAndPercent;

    act(() => {
      result.current.onAnnotateDragStop(
        columnId,
        null as any,
        newPosition,
        initialPdfPage,
      );
    });

    const updatedAnnotate = result.current.annotates[initialPdfPage][0];

    expect(updatedAnnotate.x).toEqual(newPosition.x);
    expect(updatedAnnotate.y).toEqual(newPosition.y);
  });

  it("should handle annotation resize", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "Resize Me",
      fontName: "Arial",
      color: "#000000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    const columnId = result.current.annotates[initialPdfPage][0].id;
    const rect = {
      heightPercent: 50,
      widthPercent: 50,
      height: 100,
      width: 100,
      xPercent: 10,
      yPercent: 10,
      x: 10,
      y: 10,
    } satisfies RectPxAndPercent;

    act(() => {
      result.current.onAnnotateResizeStop(
        columnId,
        null as any,
        rect,
        initialPdfPage,
      );
    });

    const updatedAnnotate = result.current.annotates[initialPdfPage][0];

    expect(updatedAnnotate.width).toEqual(rect.width);
    expect(updatedAnnotate.height).toEqual(rect.height);
    expect(updatedAnnotate.x).toEqual(rect.x);
    expect(updatedAnnotate.y).toEqual(rect.y);
  });

  it("should update column titles in annotations", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );
    const columnAnnotateData = {
      value: "OldTitle",
      fontName: "Arial",
      color: "#000000",
      textFitRectBox: true,
    } satisfies ColumnAnnotateFormSchema;

    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, columnAnnotateData);
    });

    act(() => {
      result.current.replaceAnnotatesColumnValue("OldTitle", "NewTitle");
    });

    const updatedAnnotate = result.current.annotates[initialPdfPage][0];

    if (updatedAnnotate.type !== "column") {
      throw new Error("Column annotate type is not 'column'");
    }

    expect(updatedAnnotate.value).toBe("NewTitle");
  });

  it("should remove unnecessary annotations", () => {
    const { result } = renderHook(() =>
      useAutoCertAnnotate(UseAutoCertAnnotateParams),
    );

    // Add a column annotate that will be kept
    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, {
        value: "KeepThis",
        fontName: "Arial",
        color: "#000000",
        textFitRectBox: true,
      });
    });

    // Add another column annotate that will be removed
    act(() => {
      result.current.onColumnAnnotateAdd(initialPdfPage, {
        value: "RemoveThis",
        fontName: "Arial",
        color: "#000000",
        textFitRectBox: true,
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

    if (annotates[0].type !== "column") {
      throw new Error("Column annotate type is not 'column'");
    }

    expect(annotates[0].value).toBe("KeepThis");
    expect(result.current.columnAnnotates[initialPdfPage]).toHaveLength(1);
    expect(result.current.signatureAnnotates[initialPdfPage]).toBeUndefined();
  });
});
