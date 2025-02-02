"use client";
import AutoCert from "@/components/builder/AutoCert";
import useAutoCert from "@/hooks/useAutoCert";
import { useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Button } from "antd";

export default function ProjectBuilderByID() {
    const [pdfFile, setPdfFile] = useState<string>("/certificate.pdf");
    const {
        annotations,
        currentPdfPage,
        totalPdfPage,
        addSignatureField,
        addTextField,
        handleDragStop,
        handleResizeStop,
        onDocumentLoadSuccess,
        onPageLoadSuccess,
    } = useAutoCert({
        initialPdfPage: 1,
    });

    if (!pdfFile) {
        return (
            <PdfUploader setPdfFile={setPdfFile} />
        );
    }

    return (
        <>
            <AutoCert
                annotations={annotations}
                currentPage={currentPdfPage}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onPageLoadSuccess={onPageLoadSuccess}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                pdfFile={pdfFile}
            />
            <Button onClick={() => addTextField()}>Add Text Field</Button>
            <Button onClick={() => addSignatureField()}>Add Signature Field</Button>
        </>
    );
}
