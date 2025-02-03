import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Flex, Upload } from "antd";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("app:dashboard:projects:[id]:builder:pdf_uploader");

const { Dragger } = Upload;

export type PdfUploaderProps = {
    setPdfFile: (pdfFile: string) => void;
};

export default function PdfUploader({ setPdfFile }: PdfUploaderProps) {
    const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
        logger.debug("handleFileChange", info);

        const file = info.file.originFileObj;
        if (file) {
            setPdfFile(URL.createObjectURL(file));
        }
    };

    return (
        <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Dragger
                accept=".pdf"
                showUploadList={false}
                onChange={handleFileChange}
                style={{ padding: "20px" }}
            >
                <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                </p>
                <p className="ant-upload-text">
                    (Temporary for development only) Click or drag PDF file to this area to upload
                </p>
                <p className="ant-upload-hint">
                    Support for a single PDF file upload. Please ensure the file
                    is in PDF format.
                </p>
            </Dragger>
        </Flex>
    );
}
