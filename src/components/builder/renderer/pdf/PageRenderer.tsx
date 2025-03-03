"use client";
import { useEffect, useRef, useState } from "react";
import { WHSize } from "../../annotate/BaseAnnotate";
import { createScopedLogger } from "@/utils/logger";
import { Page } from "react-pdf";
import { cn, IS_PRODUCTION } from "@/utils";
import AnnotateRenderer, {
    AnnotateRendererProps,
} from "../annotate/AnnotateRenderer";
import { theme } from "antd";

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
    const pageCanvasRef = useRef<HTMLCanvasElement>(null);

    // FIXME: For now it's okay to use this, it work on one page, however when enable multiple pages, it could potentially cause issue with annotate rendering. need to handle scale of each page separately
    const updateScale = () => {
        if (!pageCanvasRef.current) return;
        const currentWidth =
            pageCanvasRef.current.getBoundingClientRect().width;
        const originalWidth = pdfViewPort.width;
        // parsefloat and round to 2 decimal places
        const newScale = parseFloat((currentWidth / originalWidth).toFixed(3));

        logger.debug(
            `Pdf page: ${currentPdfPage}, Current width: ${currentWidth}, Original width: ${originalWidth}, Old scale ${scale},New scale: ${newScale}, Shall expect update annotation with new scale`
        );

        onScaleChange(newScale, pageNumber);
    };

    // useEffect(() => {
    //     updateScale();
    // }, []);

    // useEffect(() => {
    //     window.addEventListener("resize", updateScale);
    //     return () => {
    //         window.removeEventListener("resize", updateScale);
    //     };
    // }, [pdfViewPort]);

    return (
        <div
            onClick={() => {
                if (!selected) {
                    onPageClick(pageNumber);
                }
            }}
            ref={containerRef}
            className="relative"
            style={{
                // Prevent canvas from going beyond the viewport
                // maxWidth: pdfViewPort.width,
                // maxHeight: pdfViewPort.height,

                border:
                    selected && !previewMode ? `1px solid ${colorPrimary}` : "",
            }}
        >
            <Page
                canvasRef={pageCanvasRef}
                _className="w-full h-auto object-cover"
                onRenderSuccess={(page) => {
                    logger.debug(
                        `Page original size ${page.originalWidth}x${page.originalHeight}, Pdf Scaled size ${page.width}x${page.height}`
                    );
                    const viewport = page.getViewport({ scale: 1 });
                    setPdfViewPort({
                        width: viewport.width,
                        height: viewport.height,
                    });
                }}
                scale={1}
                pageNumber={pageNumber}
                className="pointer-events-none select-none"
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
                    Scale: {scale}
                </div>
            )}
        </div>
    );
}
