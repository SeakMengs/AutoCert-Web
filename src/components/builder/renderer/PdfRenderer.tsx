"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

export interface PdfRendererProps {
    pdfFile: string;
    currentPdfPage: number;
    onDocumentLoadSuccess?: (pdf: DocumentCallback) => void;
    onPageLoadSuccess?: (page: PageCallback) => void;
}

export default function PdfRenderer({
    pdfFile,
    currentPdfPage,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
}: PdfRendererProps) {
    return (
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
                scale={1}
                onRenderSuccess={onPageLoadSuccess}
                pageNumber={currentPdfPage}
                className="pointer-events-none select-none"
            />
        </Document>
    );
}
