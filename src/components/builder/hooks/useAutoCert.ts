import {
    BaseAnnotateProps,
    WHSize,
    XYPosition,
} from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import { tempSignData } from "./temp";
import { BaseTextAnnotate, TextAnnotateFont } from "../annotate/TextAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";
import { IS_PRODUCTION_ENV } from "@/utils";
import { getAnnotateByScale, getAnnotateByScaleRatio, getAnnotatesByScale } from "../utils";

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

const SignatureAnnotateWidth = 140;
const SignatureAnnotateHeight = 90;

const AnnotateColor = "#FFC4C4";

// Scale ratio threshold to determine if the scale is too small to update annotates
const ScaleRatioThreshold = 0;
export interface UseAutoCertProps {
    initialPdfPage: number;
}

export default function useAutoCert({ initialPdfPage = 1 }: UseAutoCertProps) {
    const [totalPdfPage, setTotalPdfPage] = useState<number>(0);
    const [annotates, setAnnotates] = useState<AnnotateStates>({});
    const [currentPdfPage, setCurrentPdfPage] =
        useState<number>(initialPdfPage);
    const [scale, setScale] = useState<number>(1);
    const previousScaleRef = useRef<number>(scale);

    useEffect(() => {
        const previousScale = previousScaleRef.current;

        setAnnotates(getAnnotatesByScale(annotates, scale, previousScale));
        previousScaleRef.current = scale;
    }, [scale]);
    
    const getUnscaledAnnotates = (): AnnotateStates => {
        return getAnnotatesByScale(annotates, 1, scale);
    };

    const getUnscaledAnnotate = (id: string): AnnotateState | undefined => {
        const pages =  Object.keys(annotates);

        for (const page of pages) {
            const annotate = annotates[Number(page)].find((annotate) => annotate.id === id);
            if (annotate) {
                return getAnnotateByScale(annotate, 1, scale);
            }
        }

        return undefined;
    };

    const onDocumentLoadSuccess = async (
        pdf: DocumentCallback
    ): Promise<void> => {
        logger.debug(`Pdf loaded, total pages: ${pdf.numPages}`);

        setTotalPdfPage(pdf.numPages);
        setCurrentPdfPage(initialPdfPage);

        if (!IS_PRODUCTION_ENV) {
            const page = await pdf.getPage(1);
            const width = page.view[2];
            const height = page.view[3];
            logger.debug(`Pdf width: ${width}, height: ${height}`);
        }
    };

    const onPageLoadSuccess = async (page: PageCallback): Promise<void> => {
        logger.debug(
            `Page original size ${page.originalWidth}x${page.originalHeight}, Pdf Scaled size ${page.width}x${page.height}`
        );
    };

    const addTextField = (): void => {
        logger.debug("Adding text field");

        // Since it has not scaled before, we can pass scale as scale ratio
        const newTextField = getAnnotateByScaleRatio(
            {
                id: nanoid(),
                type: "text",
                position: { x: 100, y: 100 },
                value: "Enter Text",
                size: { width: TextAnnotateWidth, height: TextAnnotateHeight },
                font: {
                    name: "Arial",
                    size: 24,
                    weight: 400,
                    color: "#000000",
                },
                color: AnnotateColor,
            } satisfies TextAnnotateState,
            scale
        );

        setAnnotates((prev) => ({
            ...prev,
            // Add the new text field to the current page
            [currentPdfPage]: [...(prev[currentPdfPage] || []), newTextField],
        }));
    };

    const addSignatureField = (): void => {
        logger.debug("Adding signature field");

        // Since it has not scaled before, we can pass scale as scale ratio
        const newSignatureField = getAnnotateByScaleRatio(
            {
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
            } satisfies SignatureAnnotateState,
            scale,
        );

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
            `Resize annotation, w:${size.width}, h:${size.height},  Position: x:${position.x}, y:${position.y}, dpi: ${window.devicePixelRatio}, Autocert scale: ${scale}`
        );

        if (!IS_PRODUCTION_ENV) {
            const unScaledAnnotate = getUnscaledAnnotate(id);

            if (unScaledAnnotate) {
                logger.debug(
                    `Unscaled annotation, w:${unScaledAnnotate.size.width}, h:${unScaledAnnotate.size.height},  Position: x:${unScaledAnnotate.position.x}, y:${unScaledAnnotate.position.y}`
                );
            }
        }

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
                annotation.id === id ? { ...annotation, position } : annotation
            ),
        }));
    };

    return {
        annotates,
        currentPdfPage,
        totalPdfPage,
        scale,
        setScale,
        getUnscaledAnnotates,
        getUnscaledAnnotate,
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
