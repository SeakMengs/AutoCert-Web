"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { WHSize } from "../../annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { Page } from "react-pdf";
import { cn, IS_PRODUCTION } from "@/utils";
import AnnotateRenderer, {
    AnnotateRendererProps,
} from "../annotate/AnnotateRenderer";
import { theme } from "antd";
import { PageCallback } from "react-pdf/src/shared/types.js";

const logger = createScopedLogger("components:builder:renderer:pdf:Page");

export interface PageRendererProps extends AnnotateRendererProps {
    pageNumber: number;
    // Scale of the canvas element, not the PDF page scale
    scale: number;
    onScaleChange: (scale: number, page: number) => void;
    onPageClick: (page: number) => void;
}

export default function PageRenderer({
    // pdf page
    pageNumber,
    scale,
    onPageClick,
    onScaleChange,

    // annotate
    annotatesByPage,
    selectedAnnotateId,
    onAnnotateSelect,
    onDragStop,
    onResizeStop,
    previewMode,
    currentPdfPage,
    zoomScale,
}: PageRendererProps) {
    const {
        token: { colorPrimary },
    } = theme.useToken();
    const selected = currentPdfPage === pageNumber;
    const [pdfViewPort, setPdfViewPort] = useState<WHSize>({
        width: 0,
        height: 0,
    });
    const containerRef = useRef<HTMLDivElement>(null);

    const onPageRenderSuccess = (page: PageCallback) => {
        // const viewport = page.getViewport({ scale: 1 });
        logger.debug(
            `Page original size ${page.originalWidth}x${page.originalHeight}, Pdf current size ${page.width}x${page.height}`
        );
        setPdfViewPort({
            width: page.originalWidth,
            height: page.originalHeight,
        });
    };

    const updateScale = useCallback(() => {
        if (!containerRef.current) return;
        const currentWidth = containerRef.current.getBoundingClientRect().width;
        const originalWidth = pdfViewPort.width;

        if (originalWidth === 0) {
            logger.warn(
                `Pdf page: ${pageNumber}, Original width is 0, skip scale update`
            );
            return;
        }

        const newScale =
            parseFloat((currentWidth / originalWidth).toFixed(3)) || 1;

        // logger.debug(
        //     `Pdf page: ${pageNumber}, Current width: ${currentWidth}, Original width: ${originalWidth}, Old scale ${scale},New scale: ${newScale}, Shall expect update annotation with new scale`
        // );

        onScaleChange(newScale, pageNumber);
    }, [pdfViewPort, onScaleChange, pageNumber]);

    useEffect(() => {
        if (pdfViewPort.width > 0) {
            updateScale();
        }
        // when zoomScale change, check for scale update
    }, [pdfViewPort.width, zoomScale]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            updateScale();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [pdfViewPort.width, updateScale]);

    return (
        <div
            id={`autocert-pdf-page-${pageNumber}`}
            onClick={() => {
                if (!selected) {
                    onPageClick(pageNumber);
                }
            }}
            ref={containerRef}
            className="relative"
            style={{
                // Prevent canvas from going beyond the viewport
                maxWidth: pdfViewPort.width,
                maxHeight: pdfViewPort.height,
            }}
        >
            <Page
                _className="w-full h-auto object-cover"
                onRenderSuccess={onPageRenderSuccess}
                scale={1}
                pageNumber={pageNumber}
                className="pointer-events-none select-none"
                canvasRef={(ref) => {
                    if (ref) {
                        ref.style.border = selected
                            ? `1px solid ${colorPrimary}`
                            : "";
                    }
                }}
            />
            <AnnotateRenderer
                pageNumber={pageNumber}
                zoomScale={zoomScale}
                scale={scale}
                previewMode={previewMode}
                annotatesByPage={annotatesByPage}
                selectedAnnotateId={selectedAnnotateId}
                currentPdfPage={currentPdfPage}
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
                onAnnotateSelect={onAnnotateSelect}
            />
            {!IS_PRODUCTION && (
                <div className="absolute top-2 left-2 bg-gray-900 text-white text-sm px-2 py-1 rounded">
                    Scale: {scale}, Zoom: {zoomScale}
                </div>
            )}
        </div>
    );
}
