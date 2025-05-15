"use client";
import AutoCert, { AutoCertPanel } from "@/components/builder/AutoCert";
import { useAutoCert } from "@/hooks/useAutoCert";
import { Flex, Splitter, theme } from "antd";
import { BarSize } from "@/app/dashboard/layout_client";
import ZoomPanel from "@/components/builder/panel/zoom/ZoomPanel";
import Header from "./header";
import { z } from "zod";
import { getProjectByIdSuccessResponseSchema } from "./schema";
export interface ProjectBuilderProps
  extends z.infer<typeof getProjectByIdSuccessResponseSchema> {}

export default function Builder({ project, roles }: ProjectBuilderProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const {
    annotates,
    columnAnnotates,
    signatureAnnotates,
    currentPdfPage,
    selectedAnnotateId,
    zoomScale,
    transformWrapperRef,
    settings,
    onQrCodeEnabledChange,
    onZoomScaleChange,
    onColumnAnnotateAdd,
    onColumnAnnotateUpdate,
    onColumnAnnotateRemove,
    onSignatureAnnotateAdd,
    onSignatureAnnotateRemove,
    onSignatureAnnotateInvite,
    onSignatureAnnotateSign,
    onAnnotateDragStop,
    onAnnotateResizeStop,
    onAnnotateSelect,
    onDocumentLoadSuccess,
    onGenerateCertificates,
    onPageClick,

    rows,
    columns,
    tableLoading,
    onRowAdd,
    onRowUpdate,
    onRowsDelete,
    onColumnAdd,
    onColumnDelete,
    onAutoCertTableColumnTitleUpdate,
    onImportFromCSV,
    onExportToCSV,  
  } = useAutoCert();

  return (
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
        <Header title={project.title} />
        <Flex
          // className="w-full h-full p-2 overflow-auto scrollbar-hide"
          className="relative w-full overflow-auto"
          justify="center"
          align="center"
          style={{
            height: `calc(100vh - ${BarSize}px)`,
          }}
        >
          <AutoCert
            // roles={roles}
            // transformWrapperRef={transformWrapperRef}
            // zoomScale={zoomScale}
            // onZoomScaleChange={onZoomScaleChange}
            // onPageClick={onPageClick}
            previewMode={false}
            // annotates={annotates}
            // currentPdfPage={currentPdfPage}
            // selectedAnnotateId={selectedAnnotateId}
            // onDocumentLoadSuccess={onDocumentLoadSuccess}
            // onDragStop={onAnnotateDragStop}
            // onResizeStop={onAnnotateResizeStop}
            // onAnnotateSelect={onAnnotateSelect}
            // pdfFile={project.templateUrl}
          />
          <div className="absolute bottom-4 right-4">
            <ZoomPanel
              transformWrapperRef={transformWrapperRef}
              zoomScale={zoomScale}
            />
          </div>
        </Flex>
      </Splitter.Panel>
      <Splitter.Panel
        defaultSize={"30%"}
        max={"70%"}
        style={{
          borderLeft: `1px solid ${colorSplit}`,
        }}
        className="w-1/5"
        collapsible
      >
        <AutoCertPanel
          projectId={project.id}
          signatureAnnotates={signatureAnnotates}
          columns={columns}
          rows={rows}
          tableLoading={tableLoading}
          qrCodeEnabled={settings.qrCodeEnabled}
          onQrCodeEnabledChange={onQrCodeEnabledChange}
          onColumnUpdate={onAutoCertTableColumnTitleUpdate}
          onRowAdd={onRowAdd}
          onRowUpdate={onRowUpdate}
          onRowsDelete={onRowsDelete}
          onColumnAdd={onColumnAdd}
          onColumnDelete={onColumnDelete}
          onImportFromCSV={onImportFromCSV}
          onExportToCSV={onExportToCSV}
          // End of table props
          currentPdfPage={currentPdfPage}
          selectedAnnotateId={selectedAnnotateId}
          onGenerateCertificates={onGenerateCertificates}
          columnAnnotates={columnAnnotates}
          onColumnAnnotateAdd={onColumnAnnotateAdd}
          onColumnAnnotateUpdate={onColumnAnnotateUpdate}
          onColumnAnnotateRemove={onColumnAnnotateRemove}
          onSignatureAnnotateAdd={onSignatureAnnotateAdd}
          onSignatureAnnotateRemove={onSignatureAnnotateRemove}
          onSignatureAnnotateInvite={onSignatureAnnotateInvite}
          onSignatureAnnotateSign={onSignatureAnnotateSign}
          onAnnotateSelect={onAnnotateSelect}
        />
      </Splitter.Panel>
    </Splitter>
  );
}
