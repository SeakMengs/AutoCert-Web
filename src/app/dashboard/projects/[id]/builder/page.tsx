"use client";
// Rename to avoid conflict with antd
import AutoCert, {
    AutoCertPanel,
    AutoCertTable,
} from "@/components/builder/AutoCert";
import { useAutoCertTable, useAutoCert } from "@/hooks/useAutoCert";
import { useEffect, useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Flex, Typography } from "antd";

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
        onAddTextField,
        onUpdateTextField,
        onDeleteTextField,
        onAddSignatureField,
        onAnnotateDragStop,
        onAnnotateResizeStop,
        onAnnotateSelect,
        onDocumentLoadSuccess,
        onPageLoadSuccess,
        onColumnTitleChange,
        removeUnnecessaryAnnotates,
    } = useAutoCert({
        initialPdfPage: 1,
    });
    const { columns, onColumnUpdate, ...autoCertTableProps } = useAutoCertTable(
        {
            initialRows: [],
            initialColumns: [],
        }
    );

    useEffect(() => {
        removeUnnecessaryAnnotates(columns);
    }, [columns]);

    // Update column title in the table and in the annotates that used the column title
    const onAutoCertTableColumnTitleUpdate = (
        oldTitle: string,
        newTitle: string
    ): void => {
        onColumnUpdate(oldTitle, newTitle);
        onColumnTitleChange(oldTitle, newTitle);
    };

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
                        onDragStop={onAnnotateDragStop}
                        onResizeStop={onAnnotateResizeStop}
                        onAnnotateSelect={onAnnotateSelect}
                        pdfFile={pdfFile}
                    />
                    <AutoCertPanel
                        currentPdfPage={currentPdfPage}
                        selectedAnnotateId={selectedAnnotateId}
                        textAnnotates={textAnnotates}
                        tableColumns={columns}
                        onAddSignatureField={onAddSignatureField}
                        onAddTextField={onAddTextField}
                        onUpdateTextField={onUpdateTextField}
                        onDeleteTextField={onDeleteTextField}
                        onAnnotateSelect={onAnnotateSelect}
                    />
                </Flex>
            </Flex>
            <Flex vertical>
                <Title level={4}>Table management</Title>
                <AutoCertTable
                    columns={columns}
                    onColumnUpdate={onAutoCertTableColumnTitleUpdate}
                    {...autoCertTableProps}
                />
            </Flex>
        </Flex>
    );
}
