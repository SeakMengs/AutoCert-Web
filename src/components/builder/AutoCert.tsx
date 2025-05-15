"use client";
import Zoom, { ZoomProps } from "./zoom/Zoom";
import AutoCertPanel from "./panel/AutoCertPanel";
import AutoCertTable from "./panel/table/AutoCertTable";
("./panel/AutoCertPanel");
import PdfRenderer, { PdfRendererProps } from "./renderer/pdf/PdfRenderer";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { createScopedLogger } from "@/utils/logger";
import { ProjectRole } from "@/types/project";
import { useAutoCert } from "@/hooks/useAutoCert";

const logger = createScopedLogger("components:builder/AutoCert");

export interface AutoCertProps extends PdfRendererProps {
  roles: ProjectRole[];
}

export { AutoCertTable, AutoCertPanel, Zoom };

export default function AutoCert({ previewMode }: AutoCertProps) {
  const {
    pdfFileUrl,
    roles,
    annotates,
    currentPdfPage,
    selectedAnnotateId,
    zoomScale,
    transformWrapperRef,
    onZoomScaleChange,
    onAnnotateSelect,
    onDocumentLoadSuccess,
    onPageClick,
    onAnnotateDragStop,
    onAnnotateResizeStop,
  } = useAutoCert();

  const onDocumentLoadSuccessResetTransform = (pdf: DocumentCallback) => {
    if (!transformWrapperRef.current) {
      logger.error("TransformWrapper ref is null");
      return;
    }

    onDocumentLoadSuccess(pdf);
  };

  return (
    <Zoom
      transformWrapperRef={transformWrapperRef}
      onZoomScaleChange={onZoomScaleChange}
    >
      <div className="flex">
        <div className="my-8 relative w-full h-full">
          <PdfRenderer
            roles={roles}
            // share
            zoomScale={zoomScale}
            currentPdfPage={currentPdfPage}
            // For pdf
            pdfFile={pdfFileUrl}
            onDocumentLoadSuccess={onDocumentLoadSuccessResetTransform}
            // For annotates
            previewMode={previewMode}
            annotates={annotates}
            selectedAnnotateId={selectedAnnotateId}
            onDragStop={onAnnotateDragStop}
            onResizeStop={onAnnotateResizeStop}
            onAnnotateSelect={onAnnotateSelect}
            onPageClick={onPageClick}
          />
        </div>
      </div>
    </Zoom>
  );
}
