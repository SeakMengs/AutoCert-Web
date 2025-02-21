"use client";
// Rename to avoid conflict with antd
import AutoCert, {
    AutoCertPanel,
    AutoCertTable,
} from "@/components/builder/AutoCert";
import useAutoCert from "@/hooks/useAutoCert";
import { useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Flex, Space, Typography } from "antd";
import {
    AutoCertTableColumn,
    AutoCertTableRow,
} from "@/components/builder/panel/AutoCertTable";

const { Title } = Typography;

export default function ProjectBuilderByID() {
    const [pdfFile, setPdfFile] = useState<string>("/certificate.pdf");
    const {
        annotates,
        textAnnotates,
        signatureAnnotates,
        currentPdfPage,
        scale,
        selectedAnnotateId,
        setScale,
        addSignatureField,
        addTextField,
        updateTextFieldById,
        removeTextFieldById,
        handleDragStop,
        handleResizeStop,
        handleAnnotateSelect,
        onDocumentLoadSuccess,
        onPageLoadSuccess,
    } = useAutoCert({
        initialPdfPage: 1,
    });
    const [rows, setRows] = useState<AutoCertTableRow[]>([]);
    const [columns, setColumns] = useState<AutoCertTableColumn[]>([]);

    if (!pdfFile) {
        return <PdfUploader setPdfFile={setPdfFile} />;
    }

    return (
        <Flex vertical gap={32}>
            <Flex justify="center" align="center" vertical={false}>
                <Flex justify="center" vertical={false} gap={32}>
                    <AutoCert
                        scale={scale}
                        setScale={setScale}
                        previewMode={false}
                        annotates={annotates}
                        currentPdfPage={currentPdfPage}
                        selectedAnnotateId={selectedAnnotateId}
                        onDocumentLoadSuccess={onDocumentLoadSuccess}
                        onPageLoadSuccess={onPageLoadSuccess}
                        onDragStop={handleDragStop}
                        onResizeStop={handleResizeStop}
                        onAnnotateSelect={handleAnnotateSelect}
                        pdfFile={pdfFile}
                    />
                    <AutoCertPanel
                        currentPdfPage={currentPdfPage}
                        selectedAnnotateId={selectedAnnotateId}
                        textAnnotates={textAnnotates}
                        tableColumns={columns}
                        addSignatureField={addSignatureField}
                        onAddTextField={addTextField}
                        onUpdateTextFieldById={updateTextFieldById}
                        onDeleteTextFieldById={removeTextFieldById}
                        onAnnotateSelect={handleAnnotateSelect}
                    />
                </Flex>
            </Flex>
            <Flex vertical>
                <Title level={4}>Table management</Title>
                <AutoCertTable
                    rows={rows}
                    columns={columns}
                    setRows={setRows}
                    setColumns={setColumns}
                />
            </Flex>
        </Flex>
    );
}
