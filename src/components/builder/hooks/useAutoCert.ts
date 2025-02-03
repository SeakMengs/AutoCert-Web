import {
    BaseAnnotateProps,
    WHSize,
    XYPosition,
} from "@/components/builder/annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import {  useEffect, useRef, useState } from "react";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import { tempSignData } from "./temp";
import { BaseTextAnnotate, TextAnnotateFont } from "../annotate/TextAnnotate";
import { BaseSignatureAnnotate } from "../annotate/SignatureAnnotate";
import { IS_PRODUCTION_ENV } from "@/utils";

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
    const [imageScale, setImageScale] = useState<number>(1);
    const previousScaleRef = useRef<number>(imageScale);

    useEffect(() => {
        logger.debug(`Image scale changed: ${imageScale}`);

        const previousScale = previousScaleRef.current;
        // Calculate relative change of scale such that it doesn't always go smaller
        const scaleRatio = imageScale / previousScale;

        if (scaleRatio <= ScaleRatioThreshold) {
            logger.debug(
                `Scale ratio too small, not updating annotates, scaleRatio: ${scaleRatio}`
            );
            return;
        }

        // Update annotates by scale
        setAnnotates(getAnnotatesByScale(annotates, scaleRatio));

        previousScaleRef.current = imageScale;
    }, [imageScale]);

    const getAnnotatesByScale = (
        prevAnnotates: AnnotateStates,
        scaleRatio: number
    ): AnnotateStates => {
        if (scaleRatio <= ScaleRatioThreshold) {
            logger.debug("Scale ratio too small, not updating annotates");
            return prevAnnotates;
        }

        const newAnnotates: AnnotateStates = {};

        for (const page in prevAnnotates) {
            const pageAnnotates = prevAnnotates[page];
            newAnnotates[page] = pageAnnotates.map((annotate) => {
                return getAnnotateByScale(annotate, scaleRatio);
            });
        }
        return newAnnotates;
    };

    const getAnnotateByScale = (
        annotate: AnnotateState,
        scaleRatio: number
    ) => {
        if (scaleRatio <= ScaleRatioThreshold) {
            logger.debug("Scale ratio too small, not updating annotate");
            return annotate;
        }

        const baseProps = {
            position: {
                x: annotate.position.x * scaleRatio,
                y: annotate.position.y * scaleRatio,
            },
            size: {
                width: annotate.size.width * scaleRatio,
                height: annotate.size.height * scaleRatio,
            },
        };

        if (annotate.type !== "text") {
            return { ...annotate, ...baseProps };
        }

        return {
            ...annotate,
            ...baseProps,
            font: {
                ...annotate.font,
                size: annotate.font.size * scaleRatio,
            },
        };
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
            `Page original size ${page.originalWidth}x${page.originalHeight}, Scaled size ${page.width}x${page.height}`
        );
    };

    const addTextField = (): void => {
        logger.debug("Adding text field");

        const newTextField = getAnnotateByScale(
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
            imageScale
        );

        setAnnotates((prev) => ({
            ...prev,
            // Add the new text field to the current page
            [currentPdfPage]: [...(prev[currentPdfPage] || []), newTextField],
        }));
    };

    const addSignatureField = (): void => {
        logger.debug("Adding signature field");

        const newSignatureField = getAnnotateByScale(
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
            imageScale
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
                annotation.id === id ? { ...annotation, position } : annotation
            ),
        }));
    };

    return {
        annotates,
        currentPdfPage,
        totalPdfPage,
        imageScale,
        setImageScale,
        getAnnotatesByScale,
        getAnnotateByScale,
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
