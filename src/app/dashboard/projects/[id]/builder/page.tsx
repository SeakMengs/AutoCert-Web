"use client";
import AutoCert, { AutoCertPanel } from "@/components/builder/AutoCert";
import { useAutoCertTable, useAutoCert } from "@/hooks/useAutoCert";
import { useEffect, useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Flex, Splitter, theme, Typography } from "antd";
import { BarSize, headerStyle } from "@/app/dashboard/layout_client";

const { Title } = Typography;

export default function ProjectBuilderByID() {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const [pdfFile, setPdfFile] = useState<string>("/certificate_merged.pdf");
  // const [pdfFile, setPdfFile] = useState<string>("/certificate.pdf");
  const {
    annotates,
    textAnnotates,
    signatureAnnotates,
    currentPdfPage,
    selectedAnnotateId,
    pagesScale,
    zoomScale,
    transformWrapperRef,
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
    onColumnTitleChange,
    onPageClick,
    removeUnnecessaryAnnotates,
  } = useAutoCert({
    initialPdfPage: 1,
  });
  const { columns, onColumnUpdate, ...autoCertTableProps } = useAutoCertTable({
    initialRows: [],
    initialColumns: [],
  });

  useEffect(() => {
    removeUnnecessaryAnnotates(columns);
  }, [columns]);

  // Update column title in the table and in the annotates that used the column title
  const onAutoCertTableColumnTitleUpdate = (
    oldTitle: string,
    newTitle: string,
  ): void => {
    onColumnUpdate(oldTitle, newTitle);
    onColumnTitleChange(oldTitle, newTitle);
  };

  if (!pdfFile) {
    return <PdfUploader setPdfFile={setPdfFile} />;
  }

  return (
    <>
      <Splitter
        // to reserve space for the header
        className={`w-full overflow-hidden`}
        style={
          {
            // height: `calc(100vh - ${BarSize}px)`,
          }
        }
      >
        <Splitter.Panel className="p-0 overflow-hidden">
          <Header />
          <Flex
            className="w-full h-full p-2 overflow-auto scrollbar-hide"
            justify="center"
            align="center"
          >
            <AutoCert
              transformWrapperRef={transformWrapperRef}
              zoomScale={zoomScale}
              onZoomScaleChange={onZoomScaleChange}
              onPageClick={onPageClick}
              pagesScale={pagesScale}
              onScaleChange={onScaleChange}
              previewMode={false}
              annotates={annotates}
              currentPdfPage={currentPdfPage}
              selectedAnnotateId={selectedAnnotateId}
              onDocumentLoadSuccess={onDocumentLoadSuccess}
              onDragStop={onAnnotateDragStop}
              onResizeStop={onAnnotateResizeStop}
              onAnnotateSelect={onAnnotateSelect}
              pdfFile={pdfFile}
            />
          </Flex>
        </Splitter.Panel>
        <Splitter.Panel
          defaultSize={window.innerWidth / 5}
          max={window.innerWidth / 2}
          style={{
            borderLeft: `1px solid ${colorSplit}`,
          }}
          className="w-1/5 overflow-y-auto overflow-x-hidden"
          collapsible
        >
          <AutoCertPanel
            {...autoCertTableProps}
            signatureAnnotates={signatureAnnotates}
            columns={columns}
            onColumnUpdate={onAutoCertTableColumnTitleUpdate}
            // End of table props
            currentPdfPage={currentPdfPage}
            selectedAnnotateId={selectedAnnotateId}
            textAnnotates={textAnnotates}
            onAddSignatureField={onAddSignatureField}
            onAddTextField={onAddTextField}
            onUpdateTextField={onUpdateTextField}
            onDeleteTextField={onDeleteTextField}
            onAnnotateSelect={onAnnotateSelect}
          />
        </Splitter.Panel>
      </Splitter>
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
