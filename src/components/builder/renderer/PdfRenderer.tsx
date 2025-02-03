"use client";
import { Document, Page, pdfjs, usePageContext } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import type { RenderParameters } from "pdfjs-dist/types/src/display/api.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { IS_PRODUCTION_ENV } from "@/utils";
import { createScopedLogger } from "@/utils/logger";
import { WHSize } from "../annotate/BaseAnnotate";

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
        logger.debug
        if (!pageCanvasRef.current) return;
        const currentWidth = pageCanvasRef.current.clientWidth;
        const originalWidth = pdfViewPort.width;
        const newScale = currentWidth / originalWidth;

        if (newScale !== scale && newScale > 0) {
            if (newScale > 1) {
                setScale(1);
                return;
            }

            setScale(newScale);
        }
    };

    useEffect(() => {
        updateScale();

        window.addEventListener("resize", updateScale);
        return () => {
            window.removeEventListener("resize", updateScale);
        };
    }, [pdfViewPort]);

    return (
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
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
                {!IS_PRODUCTION_ENV && (
                    <div className="absolute top-2 left-2 bg-gray-900 text-white text-sm px-2 py-1 rounded">
                        Scale: {scale.toFixed(2)}
                    </div>
                )}
            </div>
        </Document>
    );
}
