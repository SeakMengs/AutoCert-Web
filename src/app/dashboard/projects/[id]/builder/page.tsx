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

const { Title, Text } = Typography;

export default function ProjectBuilderByID() {
    const [pdfFile, setPdfFile] = useState<string>("/certificate.pdf");
    const {
        annotates,
        currentPdfPage,
        scale,
        selectedAnnotateId,
        setScale,
        addSignatureField,
        addTextField,
        handleDragStop,
        handleResizeStop,
        handleAnnotateSelect,
        onDocumentLoadSuccess,
        onPageLoadSuccess,
    } = useAutoCert({
        initialPdfPage: 1,
    });

    if (!pdfFile) {
        return <PdfUploader setPdfFile={setPdfFile} />;
    }

    return (
        <Flex vertical gap={32}>
            <Flex justify="center" align="center" vertical={false}>
                <Space direction="horizontal">
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
                        addSignatureField={addSignatureField}
                        addTextField={addTextField}
                    />
                </Space>
            </Flex>
            <Space direction="vertical">
                <Text strong>Table management</Text>
                <AutoCertTable />
            </Space>
        </Flex>
    );
}
