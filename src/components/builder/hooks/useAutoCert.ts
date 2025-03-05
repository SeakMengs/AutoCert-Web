import {
  BaseAnnotateProps,
  WHSize,
  XYPosition,
} from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { tempSignData } from "./temp";
import { BaseTextAnnotate } from "../annotate/TextAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";
import { IS_PRODUCTION } from "@/utils";
import { TextAnnotateFormSchema } from "../panel/tool/text/AutoCertTextTool";
import { AutoCertTableColumn } from "../panel/table/AutoCertTable";
import { MIN_SCALE } from "../utils";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

const logger = createScopedLogger("components:builder:hook:useAutoCert");

type BaseAnnotateState = Omit<
  BaseAnnotateProps,
  | "children"
  | "resizable"
  | "onDragStop"
  | "onResizeStop"
  | "onAnnotateSelect"
  | "previewMode"
  | "selected"
  | "scale"
  | "zoomScale"
  | "pageNumber"
> & {
  type: "text" | "signature";
};

export type TextAnnotateState = BaseAnnotateState &
  BaseTextAnnotate & {
    type: "text";
  };

// page
export type TextAnnotateStates = Record<number, TextAnnotateState[]>;

export type SignatureAnnotateState = BaseAnnotateState &
  BaseSignatureAnnotate & {
    type: "signature";
  };

// page
export type SignatureAnnotateStates = Record<number, SignatureAnnotateState[]>;

export type AnnotateState = TextAnnotateState | SignatureAnnotateState;

// Each page has a list of annotates
export type AnnotateStates = Record<number, AnnotateState[]>;

// Since each pdf page might have different scale
export type PagesScale = Record<number, number>;

const TextAnnotateWidth = 150;
const TextAnnotateHeight = 40;

const SignatureAnnotateWidth = 140;
const SignatureAnnotateHeight = 90;

export const AnnotateColor = "#FFC4C4";
export const AnnotateFontSize = 24;

export interface UseAutoCertProps {
  initialPdfPage: number;
}

const newTextAnnotate = (): TextAnnotateState => {
  return {
    id: nanoid(),
    type: "text",
    position: { x: 0, y: 0 },
    value: "Enter Text",
    size: { width: TextAnnotateWidth, height: TextAnnotateHeight },
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
  const [textAnnotates, setTextAnnotates] = useState<TextAnnotateStates>({});
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
   * Update text and signature annotates when annotates change
   *  Technically not efficient enough, however since we only handle a few annotates, it should be fine
   * */
  useEffect(() => {
    const texts: TextAnnotateStates = {};
    const signatures: SignatureAnnotateStates = {};
    const pages = Object.keys(annotates);

    pages.forEach((p) => {
      annotates[Number(p)].forEach((a) => {
        switch (a.type) {
          case "text":
            texts[Number(p)] = [...(texts[Number(p)] || []), a];
            break;
          case "signature":
            signatures[Number(p)] = [...(signatures[Number(p)] || []), a];
            break;
        }
      });
    });

    setTextAnnotates(texts);
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

  const onTextAnnotateAdd = (
    page: number,
    { value, color, fontName }: TextAnnotateFormSchema,
  ): void => {
    logger.debug("Adding text field");

    let newTA = newTextAnnotate();
    newTA = {
      ...newTA,
      value,
      color,
      font: {
        ...newTA.font,
        name: fontName,
      },
    };

    setAnnotates((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newTA],
    }));
    setSelectedAnnotateId(newTA.id);
  };

  const onTextAnnotateUpdate = (
    id: string,
    { value, fontName, color }: TextAnnotateFormSchema,
  ): void => {
    logger.debug(`Update text field with id ${id}`);

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Text field with id ${id} not found`);
      return;
    }

    const { annotate, page } = existingAnnotate;
    if (annotate.type !== "text") {
      logger.warn(`Text field with id ${id} not found`);
      return;
    }

    const updatedAnnotate = {
      ...annotate,
      font: {
        ...annotate.font,
        name: fontName,
      },
      value,
      color,
    } satisfies TextAnnotateState;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].map((a) => (a.id === id ? updatedAnnotate : a)),
    }));
    setSelectedAnnotateId(updatedAnnotate.id);
  };

  const onTextAnnotateRemove = (id: string): void => {
    logger.debug(`Remove text field with id ${id}`);

    const existingAnnotate = findAnnotateById(id);
    if (!existingAnnotate) {
      logger.warn(`Text field with id ${id} not found`);
      return;
    }

    const { page } = existingAnnotate;

    setAnnotates((prev) => ({
      ...prev,
      [page]: prev[page].filter((annotation) => annotation.id !== id),
    }));
  };

  const onSignatureAnnotateAdd = (): void => {
    logger.debug("Adding signature field");

    // Since it has not scaled before, we can pass scale as scale ratio
    const newSA = newSignatureAnnotate();

    setAnnotates((prev) => ({
      ...prev,
      // Add the new signature field to the current page
      [currentPdfPage]: [...(prev[currentPdfPage] || []), newSA],
    }));
  };

  const onAnnotateResizeStop = (
    id: string,
    size: WHSize,
    position: XYPosition,
    pageNumber: number,
  ): void => {
    logger.debug(
      `Resize annotation (unscaled), w:${size.width}, h:${size.height},  Position: x:${position.x}, y:${position.y}, dpi: ${window.devicePixelRatio}, page scale: ${pagesScale[pageNumber]}, zoomScale: ${zoomScale}`,
    );

    setAnnotates((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((annotation) =>
        annotation.id === id ? { ...annotation, size, position } : annotation,
      ),
    }));
  };

  const onAnnotateDragStop = (
    id: string,
    _e: any,
    position: XYPosition,
    pageNumber: number,
  ): void => {
    logger.debug(`Drag annotation, Position: x:${position.x}, y:${position.y}`);

    setAnnotates((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((annotation) =>
        annotation.id === id ? { ...annotation, position } : annotation,
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

  const onColumnTitleChange = (oldTitle: string, newTitle: string): void => {
    const pages = Object.keys(annotates);
    const newAnnotates = { ...annotates };

    // update value of annotate text with value of oldTitle to newTitle
    pages.forEach((p) => {
      const pageAnnotates = newAnnotates[Number(p)];
      pageAnnotates.forEach((a) => {
        if (a.type === "text" && a.value === oldTitle) {
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
        (a) => !(a.type === "text" && !tableTitles.includes(a.value)),
      );
    });

    setAnnotates(newAnnotates);
  };

  return {
    annotates,
    textAnnotates,
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
    onTextAnnotateAdd,
    onTextAnnotateUpdate,
    onTextAnnotateRemove,
    onSignatureAnnotateAdd,
    onAnnotateResizeStop,
    onAnnotateDragStop,
    onAnnotateSelect,
    onColumnTitleChange,
    removeUnnecessaryAnnotates,
  };
}
