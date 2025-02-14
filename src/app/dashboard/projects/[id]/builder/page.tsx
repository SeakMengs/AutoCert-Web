"use client";
import AutoCert from "@/components/builder/AutoCert";
import useAutoCert from "@/hooks/useAutoCert";
import { useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Button, Flex, Space } from "antd";
import { EditOutlined, SignatureOutlined } from "@ant-design/icons";

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
        <Flex justify="center" align="center">
            <Space direction="vertical">
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
                {/* Stuff like button */}
                <Flex>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="large"
                            style={{ width: "100%" }}
                            onClick={() => addTextField()}
                        >
                            Add Text Field
                        </Button>
                        <Button
                            type="default"
                            icon={<SignatureOutlined />}
                            size="large"
                            style={{ width: "100%" }}
                            onClick={() => addSignatureField()}
                        >
                            Add Signature Field
                        </Button>
                    </Space>
                </Flex>
            </Space>
        </Flex>
    );
}
