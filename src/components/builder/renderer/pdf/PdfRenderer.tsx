"use client";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { memo, useState } from "react";
import { Result, Skeleton, Space } from "antd";
import PageRenderer, { PageRendererProps } from "./PageRenderer";
import { AnnotateStates } from "../../hooks/useAutoCertAnnotate";

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
  const [pdfPages, setPdfPages] = useState<number>(0);

  return (
    <Document
      file={pdfFile}
      onLoadSuccess={(pdf) => {
        setPdfPages(pdf.numPages);

        onDocumentLoadSuccess(pdf);
      }}
      loading={<DocumentLoading />}
      error={<DocumentError />}
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

function DocumentError() {
  return (
    <Result
      status="error"
      title="Failed to load PDF"
      subTitle="If you have download manager extension, please disable it and try again."
    />
  );
}

export default memo(PdfRenderer);
