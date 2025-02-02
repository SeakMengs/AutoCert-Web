"use client";
import { createScopedLogger } from "@/utils/logger";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

// const logger = createScopedLogger("components:builder:renderer:PdfRenderer");

export type PdfRendererProps = {
    pdfFile: string;
    currentPage: number;
    onDocumentLoadSuccess?: (pdf: DocumentCallback) => void;
    onPageLoadSuccess?: (page: PageCallback) => void;
};

export default function PdfRenderer({
    pdfFile,
    currentPage,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
}: PdfRendererProps) {
    return (
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
                scale={1}
                onRenderSuccess={onPageLoadSuccess}
                pageNumber={currentPage}
                className="pointer-events-none select-none"
            />
        </Document>
    );
}
