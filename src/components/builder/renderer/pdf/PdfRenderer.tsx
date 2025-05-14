"use client";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { memo, useEffect, useState } from "react";
import { Result, Skeleton, Space } from "antd";
import PageRenderer, { PageRendererProps } from "./PageRenderer";
import { AnnotateStates } from "../../hooks/useAutoCertAnnotate";
import PdfDocumentError from "@/components/error/PdfDocumentError";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// const logger = createScopedLogger(
//   "components:builder:renderer:pdf:PdfRenderer",
// );

export interface PdfRendererProps
  extends Omit<PageRendererProps, "scale" | "pageNumber" | "annotatesByPage"> {
  annotates: AnnotateStates;
  pdfFile: string;
  currentPdfPage: number;
  zoomScale: number;
  onDocumentLoadSuccess: (pdf: DocumentCallback) => void;
}

function PdfRenderer({
  // share
  currentPdfPage,
  zoomScale,
  // pdf
  pdfFile,
  onDocumentLoadSuccess,
  onPageClick,
  roles,

  // Annotate
  annotates,
  selectedAnnotateId,
  onAnnotateSelect,
  onDragStop,
  onResizeStop,
  previewMode,
}: PdfRendererProps) {
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [pdfPages, setPdfPages] = useState<number>(0);

  useEffect(() => {
    if (!pdfUrl) {
      setPdfUrl(pdfFile);
    }
  }, []);

  // Prevent page render before loading the pdf
  // Ref: https://github.com/wojtekmaj/react-pdf/issues/974
  useEffect(() => {
    if (pdfUrl) {
      setPdfPages(0);
    }
  }, [pdfUrl]);

  return (
    <Document
      // Key must change every refresh, since we use presigned url, using pdfFile is ok
      // Ref: https://github.com/wojtekmaj/react-pdf/issues/974#issuecomment-2758494216
      key={pdfUrl}
      file={pdfUrl}
      onLoadSuccess={(pdf) => {
        setPdfPages(pdf.numPages);

        onDocumentLoadSuccess(pdf);
      }}
      loading={<DocumentLoading />}
      error={<PdfDocumentError />}
    >
      {pdfPages > 0 && (
        <Space direction="vertical">
          {Array.from({ length: pdfPages }, (_, index) => (
            <PageRenderer
              key={`page_${index + 1}`}
              roles={roles}
              onPageClick={onPageClick}
              pageNumber={index + 1}
              // Annotate
              annotatesByPage={annotates[index + 1] ?? []}
              selectedAnnotateId={selectedAnnotateId}
              onAnnotateSelect={onAnnotateSelect}
              onDragStop={onDragStop}
              onResizeStop={onResizeStop}
              previewMode={previewMode}
              currentPdfPage={currentPdfPage}
              zoomScale={zoomScale}
            />
          ))}
        </Space>
      )}
    </Document>
  );
}

function DocumentLoading() {
  return <Skeleton.Image active className="w-96 h-96" />;
}

export default memo(PdfRenderer);
