import {
    BaseAnnotateProps,
    WHSize,
    XYPosition,
} from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useState } from "react";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import { tempSignData } from "./temp";
import { BaseTextAnnotate } from "../annotate/TextAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";

const logger = createScopedLogger("components:builder:hook:useAutoCert");

type BaseAnnotateState = Omit<
    BaseAnnotateProps,
    "children" | "resizable" | "onDragStop" | "onResizeStop" | "previewMode"
> & {
    type: "text" | "signature";
};

export type TextAnnotateState = BaseAnnotateState &
    BaseTextAnnotate & {
        type: "text";
    };

export type SignatureAnnotateState = BaseAnnotateState &
    BaseSignatureAnnotate & {
        type: "signature";
    };

export type AnnotateState = TextAnnotateState | SignatureAnnotateState;

// Each page has a list of annotates
export type AnnotateStates = Record<number, AnnotateState[]>;

const TextAnnotateWidth = 150;
const TextAnnotateHeight = 40;

const SignatureAnnotateWidth = 200;
const SignatureAnnotateHeight = 50;

const AnnotateColor = "#FFC4C4";

export interface UseAutoCertProps {
    initialPdfPage: number;
}

export default function useAutoCert({ initialPdfPage = 1 }: UseAutoCertProps) {
    const [totalPdfPage, setTotalPdfPage] = useState<number>(0);
    const [annotates, setAnnotates] = useState<AnnotateStates>({});
    const [currentPdfPage, setCurrentPdfPage] =
        useState<number>(initialPdfPage);

    const onDocumentLoadSuccess = async (
        pdf: DocumentCallback
    ): Promise<void> => {
        logger.debug(`Pdf loaded, total pages: ${pdf.numPages}`);

        setTotalPdfPage(pdf.numPages);
        setCurrentPdfPage(initialPdfPage);

        if (process.env.NODE_ENV !== "production") {
            const page = await pdf.getPage(1);
            const width = page.view[2];
            const height = page.view[3];
            logger.debug(`Pdf width: ${width}, height: ${height}`);
        }
    };

    const onPageLoadSuccess = async (page: PageCallback): Promise<void> => {
        logger.debug(
            `Page original size ${page.originalWidth}x${page.originalHeight}, Scaled size ${page.width}x${page.height}`
        );
    };

    const addTextField = (): void => {
        logger.debug("Adding text field");

        const newTextField = {
            id: nanoid(),
            type: "text",
            position: { x: 100, y: 100 },
            value: "Enter Text",
            size: { width: TextAnnotateWidth, height: TextAnnotateHeight },
            font: {
                name: "Arial",
                size: 24,
                weight: 400,
            },
            color: AnnotateColor,
        } satisfies TextAnnotateState;

        setAnnotates((prev) => ({
            ...prev,
            // Add the new text field to the current page
            [currentPdfPage]: [...(prev[currentPdfPage] || []), newTextField],
        }));
    };

    const addSignatureField = (): void => {
        logger.debug("Adding signature field");

        const newSignatureField = {
            id: nanoid(),
            type: "signature",
            position: { x: 100, y: 100 },
            // signatureData: "",
            signatureData: tempSignData,
            size: {
                width: SignatureAnnotateWidth,
                height: SignatureAnnotateHeight,
            },
            color: AnnotateColor,
        } satisfies SignatureAnnotateState;

        setAnnotates((prev) => ({
            ...prev,
            // Add the new signature field to the current page
            [currentPdfPage]: [
                ...(prev[currentPdfPage] || []),
                newSignatureField,
            ],
        }));
    };

    const handleResizeStop = (
        id: string,
        size: WHSize,
        position: XYPosition
    ): void => {
        logger.debug(
            `Resize annotation, w:${size.width}, h:${size.height},  Position: x:${position.x}, y:${position.y} dpi: ${window.devicePixelRatio}`
        );

        setAnnotates((prev) => ({
            ...prev,
            [currentPdfPage]: (prev[currentPdfPage] || []).map((annotation) =>
                annotation.id === id
                    ? { ...annotation, size, position }
                    : annotation
            ),
        }));
    };

    const handleDragStop = (
        id: string,
        _e: any,
        position: XYPosition
    ): void => {
        logger.debug(
            `Drag annotation, Position: x:${position.x}, y:${position.y}`
        );

        setAnnotates((prev) => ({
            ...prev,
            [currentPdfPage]: (prev[currentPdfPage] || []).map((annotation) =>
                annotation.id === id
                    ? { ...annotation, position }
                    : annotation
            ),
        }));
    };

    return {
        annotates,
        currentPdfPage,
        totalPdfPage,
        onDocumentLoadSuccess,
        onPageLoadSuccess,
        setTotalPdfPage,
        setCurrentPdfPage,
        setAnnotates,
        addTextField,
        addSignatureField,
        handleResizeStop,
        handleDragStop,
    };
}