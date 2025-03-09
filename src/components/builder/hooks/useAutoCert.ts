import { BaseAnnotateProps } from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { tempSignData } from "./temp";
import { BaseColumnAnnotate } from "../annotate/ColumnAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";
import { IS_PRODUCTION } from "@/utils";
import { AutoCertTableColumn } from "../panel/table/AutoCertTable";
import { MIN_SCALE } from "../utils";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { SignatureAnnotateFormSchema } from "../panel/tool/signature/SignatureTool";
import { ColumnAnnotateFormSchema } from "../panel/tool/column/ColumnTool";

const logger = createScopedLogger("components:builder:hook:useAutoCert");

type BaseAnnotateState = Pick<
  BaseAnnotateProps,
  "id" | "position" | "size" | "color"
> & {
  type: "column" | "signature";
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

// Since each pdf page might have different scale
export type PagesScale = Record<number, number>;

const ColumnAnnotateWidth = 150;
const ColumnAnnotateHeight = 40;

const SignatureAnnotateWidth = 140;
const SignatureAnnotateHeight = 90;

export const AnnotateColor = "#FFC4C4";
export const AnnotateFontSize = 24;

export interface UseAutoCertProps {
  initialPdfPage: number;
}

const newColumnAnnotate = (): ColumnAnnotateState => {
  return {
    id: nanoid(),
    type: "column",
    position: { x: 0, y: 0 },
    value: "",
    size: { width: ColumnAnnotateWidth, height: ColumnAnnotateHeight },
    font: {
      name: "Arial",
      size: 24,
      weight: 400,
      color: "#000000",
    },
    color: AnnotateColor,
  };
};

const newSignatureAnnotate = (): SignatureAnnotateState => {
  return {
    id: nanoid(),
    type: "signature",
    position: { x: 0, y: 0 },
    signatureData: tempSignData,
    email: "",
    status: "not_invited",
    size: {
      width: SignatureAnnotateWidth,
      height: SignatureAnnotateHeight,
    },
    color: AnnotateColor,
  };
};

export default function useAutoCert({ initialPdfPage = 1 }: UseAutoCertProps) {
  // currently not use
  const [totalPdfPage, setTotalPdfPage] = useState<number>(0);
  const [annotates, setAnnotates] = useState<AnnotateStates>({});
  const [columnAnnotates, setColumnAnnotates] = useState<ColumnAnnotateStates>(
    {},
  );
  const [signatureAnnotates, setSignatureAnnotates] =
    useState<SignatureAnnotateStates>({});
  const [selectedAnnotateId, setSelectedAnnotateId] = useState<string>();
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(initialPdfPage);
  // Scale apply in annotate folder
  const [pagesScale, setPagesScale] = useState<PagesScale>({});
  // For zoom pan and pinch
  const [zoomScale, setZoomScale] = useState<number>(1);
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);

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
          case "column":
            columns[Number(p)] = [...(columns[Number(p)] || []), a];
            break;
          case "signature":
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

  const onScaleChange = (newScale: number, page: number): void => {
    if (
      (Object.hasOwn(pagesScale, page) && newScale === pagesScale[page]) ||
      newScale <= MIN_SCALE
    ) {
      logger.debug(
        `Scale is the same as before or is lesser than minimum scale or is greater than maximum, skip update: ${newScale}`,
      );
      return;
    }

    setPagesScale({
      ...pagesScale,
      [page]: newScale,
    });
  };

  const onZoomScaleChange = (newZoomScale: number): void => {
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
    { value, color, fontName }: ColumnAnnotateFormSchema,
  ): void => {
    logger.debug("Adding column annotate");

    let newCA = newColumnAnnotate();
    newCA = {
      ...newCA,
      value,
      color,
      font: {
        ...newCA.font,
        name: fontName,
      },
    };

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newCA],
    }));
    setSelectedAnnotateId(newCA.id);
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
    if (annotate.type !== "column") {
      logger.warn(
        `Column annotate with id ${id} found, but not a column annotate`,
      );
      return;
    }

    const updatedAnnotate = {
      ...annotate,
      font: {
        ...annotate.font,
        name: data.fontName,
      },
      value: data.value,
      color: data.color,
    } satisfies ColumnAnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));
    setSelectedAnnotateId(updatedAnnotate.id);
  };

  const onColumnAnnotateRemove = (id: string): void => {
    logger.debug(`Remove column annotate with id ${id}`);

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Column annotate with id ${id} not found`);
      return;
    }

    const { page, annotate } = existingAnnotate;
    if (annotate.type !== "column") {
      logger.warn(
        `Column annotate with id ${id} found, but not a column annotate`,
      );
      return;
    }

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].filter((annotation) => annotation.id !== id),
    }));
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
      status: "not_invited",
    };

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newSA],
    }));
    setSelectedAnnotateId(newSA.id);
  };

  const onSignatureAnnotateRemove = (id: string): void => {
    logger.debug(`Remove signature annotate with id ${id}`);
    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Signature annotate with id ${id} not found`);
      return;
    }

    const { page, annotate } = existingAnnotate;

    if (annotate.type !== "signature") {
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
  };

  const onSignatureAnnotateInvite = (id: string): void => {
    logger.debug(`Invite signature annotate with id ${id}`);
    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Signature annotate with id ${id} not found`);
      return;
    }
    const { annotate, page } = existingAnnotate;

    if (annotate.type !== "signature") {
      logger.warn(
        `Signature annotate with id ${id} found, but not a signature`,
      );
      return;
    }

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((annotation) =>
        annotation.id === id
          ? { ...annotation, status: "invited" }
          : annotation,
      ),
    }));
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

    setAnnotates((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((annotation) =>
        annotation.id === id
          ? {
              ...annotation,
              position: {
                x: rect.x,
                y: rect.y,
              },
              size: { width: rect.width, height: rect.height },
            }
          : annotation,
      ),
    }));
  };

  const onAnnotateDragStop: BaseAnnotateProps["onDragStop"] = (
    id,
    e,
    position,
    pageNumber,
  ): void => {
    logger.debug(`Drag annotation, Position: x:${position.x}, y:${position.y}`);

    setAnnotates((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((annotation) =>
        annotation.id === id
          ? {
              ...annotation,
              position: {
                x: position.x,
                y: position.y,
              },
            }
          : annotation,
      ),
    }));
  };

  const onAnnotateSelect = (id: string | undefined): void => {
    if (id === selectedAnnotateId) {
      logger.debug(`Select annotation event: ${id} (skip ui update)`);
      return;
    }

    logger.debug(`Select annotation event: ${id}`);

    setSelectedAnnotateId(id);
  };

  const onGenerateCertificates = (): void => {
    console.log(annotates);
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
        if (a.type === "column" && a.value === oldTitle) {
          a.value = newTitle;
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
      newAnnotates[Number(p)] = newAnnotates[Number(p)].filter(
        (a) => !(a.type === "column" && !tableTitles.includes(a.value)),
      );
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
    pagesScale,
    zoomScale,
    onZoomScaleChange,
    onScaleChange,
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
    replaceAnnotatesColumnValue,
    removeUnnecessaryAnnotates,
  };
}
