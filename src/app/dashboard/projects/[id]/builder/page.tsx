"use client";
// Rename to avoid conflict with antd
import AutoCert, {
    AutoCertPanel,
    AutoCertTable,
} from "@/components/builder/AutoCert";
import { useAutoCertTable, useAutoCert } from "@/hooks/useAutoCert";
import { useEffect, useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Flex, theme, Typography } from "antd";
import { BarSize } from "@/app/dashboard/layout_client";

const { Title } = Typography;

const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    width: "100%",
    alignItems: "center",
};

export default function ProjectBuilderByID() {
    const {
        token: { colorBgLayout, colorSplit },
    } = theme.useToken();
    const [pdfFile, setPdfFile] = useState<string>("/certificate.pdf");
    const {
        annotates,
        textAnnotates,
        signatureAnnotates,
        currentPdfPage,
        selectedAnnotateId,
        scale,
        zoomScale,
        onZoomScaleChange,
        onScaleChange,
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
        <>
            <Header />
            <Flex
                vertical={false}
                // to reserve space for the header
                className={`w-fulloverflow-hidden`}
                style={{
                    height: `calc(100vh - ${BarSize}px)`,
                }}
            >
                <Flex
                    className="w-full p-2"
                    justify="center"
                    align="center"
                    style={{
                        background: colorBgLayout,
                    }}
                >
                    <AutoCert
                        zoomScale={zoomScale}
                        onZoomScaleChange={onZoomScaleChange}
                        scale={scale}
                        onScaleChange={onScaleChange}
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
                </Flex>
                <div
                    style={{
                        borderLeft: `1px solid ${colorSplit}`,
                    }}
                    className="p-2"
                >
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
                </div>
            </Flex>
        </>
    );
}

function Header() {
    const {
        token: { colorSplit, colorBgContainer },
    } = theme.useToken();

    return (
        <header
            style={{
                ...headerStyle,
                padding: 0,
                background: colorBgContainer,
                height: BarSize,
                borderBottom: `1px solid ${colorSplit}`,
            }}
        >
            <Flex className="w-full h-full p-2" align="center">
                <Title level={4} style={{ margin: 0 }}>
                    Certificate of Achievement
                </Title>
            </Flex>
        </header>
    );
}
