"use client";
import AutoCertZoom, { AutoCertZoomProps } from "./zoom/AutoCertZoom";
import AutoCertPanel from "./panel/AutoCertPanel";
import AutoCertTable from "./panel/table/AutoCertTable";
("./panel/AutoCertPanel");
import AnnotateRenderer, {
  AnnotateRendererProps,
} from "./renderer/annotate/AnnotateRenderer";
import PdfRenderer, { PdfRendererProps } from "./renderer/pdf/PdfRenderer";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("components:builder/AutoCert");

export interface AutoCertProps extends PdfRendererProps, AutoCertZoomProps {}

export { AutoCertTable, AutoCertPanel, AutoCertZoom };

export default function AutoCert({
  // share
  currentPdfPage,
  zoomScale,
  // zoom
  transformWrapperRef,
  onZoomScaleChange,
  // pdf
  pdfFile,
  pagesScale,
  onScaleChange,
  onDocumentLoadSuccess,
  onPageClick,
  // Annotate
  annotates,
  selectedAnnotateId,
  onAnnotateSelect,
  onDragStop,
  onResizeStop,
  previewMode,
}: AutoCertProps) {
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
        <div className="my-8 relative w-full h-full">
          <PdfRenderer
            // share
            zoomScale={zoomScale}
            pagesScale={pagesScale}
            currentPdfPage={currentPdfPage}
            // For pdf
            onScaleChange={onScaleChange}
            pdfFile={pdfFile}
            onDocumentLoadSuccess={onDocumentLoadSuccessResetTransform}
            // For annotates
            previewMode={previewMode}
            annotates={annotates}
            selectedAnnotateId={selectedAnnotateId}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onAnnotateSelect={onAnnotateSelect}
            onPageClick={onPageClick}
          />
        </div>
      </div>
    </AutoCertZoom>
  );
}
