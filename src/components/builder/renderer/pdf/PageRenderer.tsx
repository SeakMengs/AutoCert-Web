"use client";
import { memo, useRef, useState } from "react";
import { createScopedLogger } from "@/utils/logger";
import { Page } from "react-pdf";
import AnnotateRenderer, {
  AnnotateRendererProps,
} from "../annotate/AnnotateRenderer";
import { theme } from "antd";
import { PageCallback } from "react-pdf/src/shared/types.js";
import { WHSize } from "../../rnd/Rnd";
import { useAutoCertStore } from "../../providers/AutoCertStoreProvider";

const logger = createScopedLogger("components:builder:renderer:pdf:Page");

export interface PageRendererProps
  extends Omit<AnnotateRendererProps, "pageOriginalSize" | "containerRef"> {
  pageNumber: number;
}

function PageRenderer({
  // pdf page
  pageNumber,

  // annotate
  annotatesByPage,
  previewMode,
}: PageRendererProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();

  const { currentPdfPage, onPageClick } = useAutoCertStore((state) => ({
    currentPdfPage: state.currentPdfPage,
    onPageClick: state.onPageClick,
  }));

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
        className="pointer-events-none select-none"
        onRenderSuccess={onPageRenderSuccess}
        scale={2}
        pageNumber={pageNumber}
        canvasRef={(ref) => {
          if (ref) {
            // ref.style.border = selected ? `1px solid ${colorPrimary}` : "";
            // ref.style.imageRendering = "crisp-edges";

            const ctx = ref.getContext("2d");
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
            }
          }
        }}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
      {pdfViewPort.height > 0 && pdfViewPort.width && (
        <>
          <AnnotateRenderer
            containerRef={containerRef}
            pageNumber={pageNumber}
            pageOriginalSize={pdfViewPort}
            previewMode={previewMode}
            annotatesByPage={annotatesByPage}
          />

          {/* {!IS_PRODUCTION && (
            <div className="absolute top-2 left-2 bg-gray-900 text-white text-sm px-2 py-1 rounded">
              Dev only! Zoom: {zoomScale}
            </div>
          )} */}
        </>
      )}
    </div>
  );
}

export default memo(PageRenderer);
