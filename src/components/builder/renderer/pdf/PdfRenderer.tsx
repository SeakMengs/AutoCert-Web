"use client";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { useState } from "react";
import { createScopedLogger } from "@/utils/logger";
import { Skeleton, Space } from "antd";
import PageRenderer, { PageRendererProps } from "./PageRenderer";
import { AnnotateStates, PagesScale } from "../../hooks/useAutoCert";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const logger = createScopedLogger(
    "components:builder:renderer:pdf:PdfRenderer"
);

export interface PdfRendererProps
    extends Omit<
        PageRendererProps,
        "scale" | "pageNumber" | "annotatesByPage"
    > {
    annotates: AnnotateStates;
    pdfFile: string;
    currentPdfPage: number;
    zoomScale: number;
    pagesScale: PagesScale;
    onDocumentLoadSuccess?: (pdf: DocumentCallback) => void;
}

export default function PdfRenderer({
    // share
    currentPdfPage,
    zoomScale,
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
}: PdfRendererProps) {
    const [pdfPages, setPdfPages] = useState<number>(0);

    return (
        <Document
            file={pdfFile}
            onLoadSuccess={(pdf) => {
                setPdfPages(pdf.numPages);

                if (typeof onDocumentLoadSuccess === "function") {
                    onDocumentLoadSuccess(pdf);
                }
            }}
            loading={<Skeleton.Image active className="w-96 h-96" />}
        >
            <Space direction="vertical">
                {Array.from({ length: pdfPages }, (_, index) => (
                    <PageRenderer
                        key={`page_${index + 1}`}
                        onPageClick={onPageClick}
                        pageNumber={index + 1}
                        scale={pagesScale[index + 1] ?? 1}
                        onScaleChange={onScaleChange}
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
        </Document>
    );
}
