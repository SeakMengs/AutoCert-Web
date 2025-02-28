"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import { useEffect, useRef, useState } from "react";
import { IS_PRODUCTION } from "@/utils";
import { createScopedLogger } from "@/utils/logger";
import { WHSize } from "../annotate/BaseAnnotate";
import { Skeleton } from "antd";
import { MIN_SCALE } from "../utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const logger = createScopedLogger("components:builder:renderer:PdfRenderer");

export interface PdfRendererProps extends CanvasToImageRendererProps {
    pdfFile: string;
    currentPdfPage: number;
    onDocumentLoadSuccess?: (pdf: DocumentCallback) => void;
    onPageLoadSuccess?: (page: PageCallback) => void;
}

export interface CanvasToImageRendererProps {
    // Scale of the canvas element, not the PDF page scale
    scale: number;
    setScale: (scale: number) => void;
}

export default function PdfRenderer({
    pdfFile,
    currentPdfPage,
    scale,
    setScale,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
}: PdfRendererProps) {
    const [pdfViewPort, setPdfViewPort] = useState<WHSize>({
        width: 1,
        height: 1,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const pageCanvasRef = useRef<HTMLCanvasElement>(null);

    const updateScale = () => {
        if (!pageCanvasRef.current) return;
        const currentWidth =
            pageCanvasRef.current.getBoundingClientRect().width;
        const originalWidth = pdfViewPort.width;
        // parsefloat and round to 2 decimal places
        const newScale = parseFloat((currentWidth / originalWidth).toFixed(2));

        logger.debug(
            `Current width: ${currentWidth}, Original width: ${originalWidth}, Old scale ${scale},New scale: ${newScale}, Shall expect update annotation with new scale`
        );

        if (newScale !== scale) {
            setScale(newScale > 1 ? 1 : newScale);
        }
    };

    useEffect(() => {
        updateScale();
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateScale);
        return () => {
            window.removeEventListener("resize", updateScale);
        };
    }, [pdfViewPort]);

    return (
        <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Skeleton.Image active className="w-96 h-96" />}
        >
            <div
                ref={containerRef}
                className="relative"
                style={{
                    // Prevent canvas from going beyond the viewport
                    maxWidth: pdfViewPort.width,
                    maxHeight: pdfViewPort.height,
                }}
            >
                <Page
                    canvasRef={pageCanvasRef}
                    _className={`w-full h-auto object-cover`}
                    onRenderSuccess={(page) => {
                        const viewport = page.getViewport({ scale: 1 });
                        setPdfViewPort({
                            width: viewport.width,
                            height: viewport.height,
                        });

                        if (typeof onPageLoadSuccess === "function") {
                            onPageLoadSuccess(page);
                        }
                    }}
                    scale={1}
                    pageNumber={currentPdfPage}
                    className="pointer-events-none select-none"
                />
                {!IS_PRODUCTION && (
                    <div className="absolute top-2 left-2 bg-gray-900 text-white text-sm px-2 py-1 rounded">
                        Scale: {scale}
                    </div>
                )}
            </div>
        </Document>
    );
}
