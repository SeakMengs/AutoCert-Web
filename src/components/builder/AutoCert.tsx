"use client";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import AutoCertZoom, { AutoCertZoomProps } from "./AutoCertZoom";
import AutoCertPanel from "./panel/AutoCertPanel";
import AutoCertTable from "./panel/table/AutoCertTable";
("./panel/AutoCertPanel");
import AnnotateRenderer, {
    AnnotateRendererProps,
} from "./renderer/AnnotateRenderer";
import PdfRenderer, { PdfRendererProps } from "./renderer/PdfRenderer";
import { useRef } from "react";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("components:builder/AutoCert");

export interface AutoCertProps
    extends AnnotateRendererProps,
        PdfRendererProps,
        Omit<AutoCertZoomProps, "transformWrapperRef"> {}

export { AutoCertTable, AutoCertPanel, AutoCertZoom };

export default function AutoCert({
    annotates,
    currentPdfPage,
    pdfFile,
    previewMode,
    scale,
    zoomScale,
    selectedAnnotateId,
    onZoomScaleChange,
    onScaleChange,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    onDragStop,
    onResizeStop,
    onAnnotateSelect,
}: AutoCertProps) {
    const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(
        null
    );

    const onPageLoadSuccessResetTransform = (page: PageCallback) => {
        if (!transformWrapperRef.current) {
            logger.error("TransformWrapper ref is null");
            return;
        }

        transformWrapperRef.current.resetTransform();

        if (typeof onPageLoadSuccess === "function") {
            onPageLoadSuccess(page);
        }
    };

    const onDocumentLoadSuccessResetTransform = (pdf: DocumentCallback) => {
        if (!transformWrapperRef.current) {
            logger.error("TransformWrapper ref is null");
            return;
        }

        // TODO: remove this temporary fix
        setTimeout(() => {
            transformWrapperRef.current?.resetTransform();
        }, 100);

        if (typeof onDocumentLoadSuccess === "function") {
            onDocumentLoadSuccess(pdf);
        }
    };

    return (
        <AutoCertZoom
            transformWrapperRef={transformWrapperRef}
            zoomScale={zoomScale}
            onZoomScaleChange={onZoomScaleChange}
        >
            <div className="flex">
                <div className="relative border">
                    <PdfRenderer
                        scale={scale}
                        onScaleChange={onScaleChange}
                        currentPdfPage={currentPdfPage}
                        pdfFile={pdfFile}
                        onDocumentLoadSuccess={
                            onDocumentLoadSuccessResetTransform
                        }
                        onPageLoadSuccess={onPageLoadSuccessResetTransform}
                    />
                    <AnnotateRenderer
                        zoomScale={zoomScale}
                        scale={scale}
                        previewMode={previewMode}
                        annotates={annotates}
                        selectedAnnotateId={selectedAnnotateId}
                        currentPdfPage={currentPdfPage}
                        onDragStop={onDragStop}
                        onResizeStop={onResizeStop}
                        onAnnotateSelect={onAnnotateSelect}
                    />
                </div>
            </div>
        </AutoCertZoom>
    );
}
