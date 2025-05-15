"use client";
import Zoom, { ZoomProps } from "./zoom/Zoom";
import AutoCertPanel from "./panel/AutoCertPanel";
import AutoCertTable from "./panel/table/AutoCertTable";
("./panel/AutoCertPanel");
import PdfRenderer, { PdfRendererProps } from "./renderer/pdf/PdfRenderer";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { createScopedLogger } from "@/utils/logger";
import { ProjectRole } from "@/types/project";
import { useAutoCertStore } from "./providers/AutoCertStoreProvider";

const logger = createScopedLogger("components:builder/AutoCert");

export interface AutoCertProps extends PdfRendererProps {}

export { AutoCertTable, AutoCertPanel, Zoom };

export default function AutoCert({ previewMode }: AutoCertProps) {
  const { transformWrapperRef, onZoomChange, onDocumentLoadSuccess } =
    useAutoCertStore((state) => ({
      transformWrapperRef: state.transformWrapperRef,
      onZoomChange: state.onZoomChange,
      onDocumentLoadSuccess: state.onDocumentLoadSuccess,
    }));

  const onDocumentLoadSuccessResetTransform = (pdf: DocumentCallback) => {
    if (!transformWrapperRef || !transformWrapperRef.current) {
      logger.error("TransformWrapper ref is null");
      return;
    }

    onDocumentLoadSuccess(pdf);
  };

  return (
    <Zoom
      transformWrapperRef={transformWrapperRef}
      onZoomScaleChange={onZoomChange}
    >
      <div className="flex">
        <div className="my-8 relative w-full h-full">
          <PdfRenderer
            // For annotates
            previewMode={previewMode}
          />
        </div>
      </div>
    </Zoom>
  );
}
