"use client";
import { memo, useRef, useState } from "react";
import { createScopedLogger } from "@/utils/logger";
import { Page } from "react-pdf";
import { IS_PRODUCTION } from "@/utils";
import AnnotateRenderer, {
  AnnotateRendererProps,
} from "../annotate/AnnotateRenderer";
import { theme } from "antd";
import { PageCallback } from "react-pdf/src/shared/types.js";
import { WHSize } from "../../rnd/Rnd";

const logger = createScopedLogger("components:builder:renderer:pdf:Page");

export interface PageRendererProps
  extends Omit<AnnotateRendererProps, "pageOriginalSize" | "containerRef"> {
  pageNumber: number;
  onPageClick: (page: number) => void;
}

function PageRenderer({
  // pdf page
  pageNumber,
  onPageClick,

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
      `Page original size ${page.originalWidth}x${page.originalHeight}, Pdf current size ${page.width}x${page.height}`,
    );
    setPdfViewPort({
      width: page.originalWidth,
      height: page.originalHeight,
    });
  };

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
            ref.style.border = selected ? `1px solid ${colorPrimary}` : "";
          }
        }}
      />
      <AnnotateRenderer
        containerRef={containerRef}
        pageNumber={pageNumber}
        zoomScale={zoomScale}
        pageOriginalSize={pdfViewPort}
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
          Dev only! Zoom: {zoomScale}
        </div>
      )}
    </div>
  );
}

export default memo(PageRenderer);
