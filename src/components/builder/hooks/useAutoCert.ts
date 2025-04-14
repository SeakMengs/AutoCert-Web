import { BaseAnnotateProps } from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { tempSignData } from "./temp";
import { BaseColumnAnnotate } from "../annotate/ColumnAnnotate";
import {
  BaseSignatureAnnotate,
} from "../annotate/SignatureAnnotate";
import { IS_PRODUCTION } from "@/utils/env";
import { AutoCertTableColumn } from "../panel/table/AutoCertTable";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { SignatureAnnotateFormSchema } from "../panel/tool/signature/SignatureTool";
import { ColumnAnnotateFormSchema } from "../panel/tool/column/ColumnTool";
import { SettingsToolProps } from "../panel/tool/settings/settings";
import useAutoCertChange, {
  AutoCertChangeType,
  UseAutoCertChangeProps,
} from "./useAutoCertChange";
import { SignatoryStatus } from "@/types/project";

const logger = createScopedLogger("components:builder:hook:useAutoCert");

export const AnnotateType = {
  Column: "column",
  Signature: "signature",
} as const;
export type AnnotateType = (typeof AnnotateType)[keyof typeof AnnotateType];

type BaseAnnotateState = Pick<
  BaseAnnotateProps,
  "id" | "x" | "y" | "width" | "height" | "color"
> & {
  type: AnnotateType;
};

export type ColumnAnnotateState = BaseAnnotateState &
  BaseColumnAnnotate & {
    type: "column";
  };

// page
export type ColumnAnnotateStates = Record<number, ColumnAnnotateState[]>;

export type SignatureAnnotateState = BaseAnnotateState &
  BaseSignatureAnnotate & {
    type: "signature";
  };

// page
export type SignatureAnnotateStates = Record<number, SignatureAnnotateState[]>;

export type AnnotateState = ColumnAnnotateState | SignatureAnnotateState;

// Each page has a list of annotates
export type AnnotateStates = Record<number, AnnotateState[]>;

const ColumnAnnotateWidth = 150;
const ColumnAnnotateHeight = 40;

const SignatureAnnotateWidth = 140;
const SignatureAnnotateHeight = 90;

export const AnnotateColor = "#FFC4C4";
export const AnnotateFontSize = 24;

const newColumnAnnotate = (): ColumnAnnotateState => {
  return {
    id: nanoid(),
    type: AnnotateType.Column,
    x: 0,
    y: 0,
    value: "",
    width: ColumnAnnotateWidth,
    height: ColumnAnnotateHeight,
    fontName: "Arial",
    fontSize: AnnotateFontSize,
    fontWeight: "regular",
    fontColor: "#000000",
    color: AnnotateColor,
    textFitRectBox: true,
  };
};

const newSignatureAnnotate = (): SignatureAnnotateState => {
  return {
    id: nanoid(),
    type: AnnotateType.Signature,
    x: 0,
    y: 0,
    width: SignatureAnnotateWidth,
    height: SignatureAnnotateHeight,
    signatureData: tempSignData,
    email: "",
    status: SignatoryStatus.NotInvited,
    color: AnnotateColor,
  };
};

export type AutoCertSettings = Pick<SettingsToolProps, "qrCodeEnabled"> & {};

export interface UseAutoCertProps
  extends Pick<UseAutoCertChangeProps, "saveChanges"> {
  initialPdfPage: number;
}

export default function useAutoCert({
  initialPdfPage = 1,
  saveChanges,
}: UseAutoCertProps) {
  const [totalPdfPage, setTotalPdfPage] = useState<number>(0);
  const [annotates, setAnnotates] = useState<AnnotateStates>({});
  const [columnAnnotates, setColumnAnnotates] = useState<ColumnAnnotateStates>(
    {},
  );
  const [signatureAnnotates, setSignatureAnnotates] =
    useState<SignatureAnnotateStates>({});
  const [selectedAnnotateId, setSelectedAnnotateId] = useState<string>();
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(initialPdfPage);
  // For zoom pan and pinch
  const [zoomScale, setZoomScale] = useState<number>(1);
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const [settings, setSettings] = useState<AutoCertSettings>({
    qrCodeEnabled: false,
  });
  const { changes, onChange, isPushingChanges } = useAutoCertChange({
    saveChanges,
  });

  /**
   * Update column and signature annotates when annotates change
   *  Technically not efficient enough, however since we only handle a few annotates, it should be fine
   * */
  useEffect(() => {
    const columns: ColumnAnnotateStates = {};
    const signatures: SignatureAnnotateStates = {};
    const pages = Object.keys(annotates);

    pages.forEach((p) => {
      annotates[Number(p)].forEach((a) => {
        switch (a.type) {
          case AnnotateType.Column:
            columns[Number(p)] = [...(columns[Number(p)] || []), a];
            break;
          case AnnotateType.Signature:
            signatures[Number(p)] = [...(signatures[Number(p)] || []), a];
            break;
        }
      });
    });

    setColumnAnnotates(columns);
    setSignatureAnnotates(signatures);
  }, [annotates]);

  const findAnnotateById = (
    id: string,
  ):
    | {
        annotate: AnnotateState;
        page: number;
      }
    | undefined => {
    const pages = Object.keys(annotates);

    for (const page of pages) {
      const annotate = annotates[Number(page)].find(
        (annotate) => annotate.id === id,
      );
      if (annotate) {
        return {
          annotate: annotate,
          page: Number(page),
        };
      }
    }

    return undefined;
  };

  const onPageClick = (page: number): void => {
    setCurrentPdfPage(page);
  };

  const onZoomScaleChange = (newZoomScale: number): void => {
    if (zoomScale === newZoomScale) {
      logger.debug(`Zoom scale not changed: ${zoomScale} skip state update`);
      return;
    }

    setZoomScale(newZoomScale);
  };

  const onDocumentLoadSuccess = async (
    pdf: DocumentCallback,
  ): Promise<void> => {
    logger.debug(`Pdf loaded, total pages: ${pdf.numPages}`);

    setTotalPdfPage(pdf.numPages);
    setCurrentPdfPage(initialPdfPage);

    if (!IS_PRODUCTION) {
      const page = await pdf.getPage(1);
      const width = page.view[2];
      const height = page.view[3];
      logger.debug(`Pdf width: ${width}, height: ${height}`);
    }
  };

  const onColumnAnnotateAdd = (
    page: number,
    data: ColumnAnnotateFormSchema,
  ): void => {
    logger.debug("Adding column annotate");

    let newCA = newColumnAnnotate();
    newCA = {
      ...newCA,
      fontName: data.fontName,
      value: data.value,
      color: data.color,
      textFitRectBox: data.textFitRectBox,
    } satisfies ColumnAnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newCA],
    }));
    setSelectedAnnotateId(newCA.id);

    onChange({
      type: AutoCertChangeType.AnnotateColumnAdd,
      data: {
        ...newCA,
        page: page,
      },
    });
  };

  const onColumnAnnotateUpdate = (
    id: string,
    data: ColumnAnnotateFormSchema,
  ): void => {
    logger.debug(`Update column annotate with id ${id}`);

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Column annotate with id ${id} not found`);
      return;
    }

    const { annotate, page } = existingAnnotate;
    if (annotate.type !== AnnotateType.Column) {
      logger.warn(
        `Column annotate with id ${id} found, but not a column annotate`,
      );
      return;
    }

    const updatedAnnotate = {
      ...annotate,
      fontName: data.fontName,
      value: data.value,
      color: data.color,
      textFitRectBox: data.textFitRectBox,
    } satisfies ColumnAnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));
    setSelectedAnnotateId(updatedAnnotate.id);

    onChange({
      type: AutoCertChangeType.AnnotateColumnUpdate,
      data: {
        ...updatedAnnotate,
        page: page,
      },
    });
  };

  const onColumnAnnotateRemove = (id: string): void => {
    logger.debug(`Remove column annotate with id ${id}`);

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Column annotate with id ${id} not found`);
      return;
    }

    const { page, annotate } = existingAnnotate;
    if (annotate.type !== AnnotateType.Column) {
      logger.warn(
        `Column annotate with id ${id} found, but not a column annotate`,
      );
      return;
    }

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].filter((annotation) => annotation.id !== id),
    }));
    setSelectedAnnotateId(undefined);

    onChange({
      type: AutoCertChangeType.AnnotateColumnRemove,
      data: {
        id: id,
      },
    });
  };

  const onSignatureAnnotateAdd = (
    page: number,
    data: SignatureAnnotateFormSchema,
  ): void => {
    logger.debug("Adding signature annotate");

    let newSA = newSignatureAnnotate();
    newSA = {
      ...newSA,
      email: data.email,
      color: data.color,
      status: SignatoryStatus.NotInvited,
    } satisfies SignatureAnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newSA],
    }));
    setSelectedAnnotateId(newSA.id);

    onChange({
      type: AutoCertChangeType.AnnotateSignatureAdd,
      data: {
        ...newSA,
        page: page,
      },
    });
  };

  const onSignatureAnnotateRemove = (id: string): void => {
    logger.debug(`Remove signature annotate with id ${id}`);
    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Signature annotate with id ${id} not found`);
      return;
    }

    const { page, annotate } = existingAnnotate;

    if (annotate.type !== AnnotateType.Signature) {
      logger.warn(
        `Signature annotate with id ${id} found, but not a signature`,
      );
      return;
    }

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].filter((annotation) => annotation.id !== id),
    }));
    setSelectedAnnotateId(undefined);

    onChange({
      type: AutoCertChangeType.AnnotateSignatureRemove,
      data: {
        id: id,
      },
    });
  };

  const onSignatureAnnotateInvite = (id: string): void => {
    logger.debug(`Invite signature annotate with id ${id}`);
    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Signature annotate with id ${id} not found`);
      return;
    }
    const { annotate, page } = existingAnnotate;

    if (annotate.type !== AnnotateType.Signature) {
      logger.warn(
        `Signature annotate with id ${id} found, but not a signature`,
      );
      return;
    }

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((annotation) =>
        annotation.id === id
          ? { ...annotation, status: SignatoryStatus.Invited }
          : annotation,
      ),
    }));

    onChange({
      type: AutoCertChangeType.AnnotateSignatureUpdate,
      data: {
        ...annotate,
        status: SignatoryStatus.Invited,
        page: page,
      },
    });
  };

  const onAnnotateResizeStop: BaseAnnotateProps["onResizeStop"] = (
    id,
    e,
    rect,
    pageNumber,
  ): void => {
    logger.debug(
      `Resize annotation, w:${rect.width}, h:${rect.height},  Position: x:${rect.x}, y:${rect.y}, dpi: ${window.devicePixelRatio}, zoomScale: ${zoomScale}`,
    );

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Annotate with id ${id} not found`);
      return;
    }

    const { annotate, page } = existingAnnotate;

    const updatedAnnotate = {
      ...annotate,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    } satisfies AnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));

    switch (updatedAnnotate.type) {
      case AnnotateType.Column:
        onChange({
          type: AutoCertChangeType.AnnotateColumnUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
      case AnnotateType.Signature:
        onChange({
          type: AutoCertChangeType.AnnotateSignatureUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
    }
  };

  const onAnnotateDragStop: BaseAnnotateProps["onDragStop"] = (
    id,
    e,
    position,
    pageNumber,
  ): void => {
    logger.debug(`Drag annotation, Position: x:${position.x}, y:${position.y}`);

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Annotate with id ${id} not found`);
      return;
    }

    const { annotate, page } = existingAnnotate;

    const updatedAnnotate = {
      ...annotate,
      x: position.x,
      y: position.y,
    } satisfies AnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));

    switch (updatedAnnotate.type) {
      case AnnotateType.Column:
        onChange({
          type: AutoCertChangeType.AnnotateColumnUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
      case AnnotateType.Signature:
        onChange({
          type: AutoCertChangeType.AnnotateSignatureUpdate,
          data: {
            ...updatedAnnotate,
            page: page,
          },
        });
        break;
    }
  };

  const onAnnotateSelect = (id: string | undefined): void => {
    if (id === selectedAnnotateId) {
      logger.debug(`Select annotation event: ${id} (skip state update)`);
      return;
    }

    logger.debug(`Select annotation event: ${id}`);

    setSelectedAnnotateId(id);
  };

  const onGenerateCertificates = (): void => {
    console.log(annotates);
  };

  const onQrCodeEnabledChange: SettingsToolProps["onQrCodeEnabledChange"] = (
    enabled: boolean,
  ): void => {
    logger.debug(`QR code enabled: ${enabled}`);
    setSettings(
      (prev) =>
        ({
          ...prev,
          qrCodeEnabled: enabled,
        }) satisfies AutoCertSettings,
    );

    onChange({
      type: AutoCertChangeType.SettingsUpdate,
      data: {
        qrCodeEnabled: enabled,
      },
    });
  };

  const replaceAnnotatesColumnValue = (
    oldTitle: string,
    newTitle: string,
  ): void => {
    const pages = Object.keys(annotates);
    const newAnnotates = { ...annotates };

    // update value of annotate column with value of oldTitle to newTitle
    pages.forEach((p) => {
      const pageAnnotates = newAnnotates[Number(p)];
      pageAnnotates.forEach((a) => {
        if (a.type === AnnotateType.Column && a.value === oldTitle) {
          a.value = newTitle;

          onChange({
            type: AutoCertChangeType.AnnotateColumnUpdate,
            data: {
              ...a,
              page: Number(p),
            },
          });
        }
      });
    });

    setAnnotates(newAnnotates);
  };

  // Remove annotates that does not exist in the table column
  const removeUnnecessaryAnnotates = (columns: AutoCertTableColumn[]): void => {
    const tableTitles = columns.map((c) => c.title);
    const pages = Object.keys(annotates);
    const newAnnotates = { ...annotates };

    pages.forEach((p) => {
      const updatedPageAnnotates = newAnnotates[Number(p)].filter((a) => {
        const shouldKeep = !(
          a.type === AnnotateType.Column && !tableTitles.includes(a.value)
        );
        if (!shouldKeep) {
          onChange({
            type: AutoCertChangeType.AnnotateColumnRemove,
            data: {
              id: a.id,
            },
          });
        }
        return shouldKeep;
      });
      newAnnotates[Number(p)] = updatedPageAnnotates;
    });

    setAnnotates(newAnnotates);
  };

  return {
    annotates,
    columnAnnotates,
    signatureAnnotates,
    selectedAnnotateId,
    currentPdfPage,
    totalPdfPage,
    transformWrapperRef,
    zoomScale,
    settings,
    onZoomScaleChange,
    onDocumentLoadSuccess,
    onPageClick,
    onColumnAnnotateAdd,
    onColumnAnnotateUpdate,
    onColumnAnnotateRemove,
    onSignatureAnnotateAdd,
    onSignatureAnnotateRemove,
    onSignatureAnnotateInvite,
    onAnnotateResizeStop,
    onAnnotateDragStop,
    onAnnotateSelect,
    onGenerateCertificates,
    onQrCodeEnabledChange,
    replaceAnnotatesColumnValue,
    removeUnnecessaryAnnotates,
  };
}
