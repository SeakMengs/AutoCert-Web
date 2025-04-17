"use client";
import AutoCert, { AutoCertPanel } from "@/components/builder/AutoCert";
import { useAutoCert } from "@/hooks/useAutoCert";
import { useEffect, useState } from "react";
import PdfUploader from "./pdf_uploader";
import { Flex, Splitter, theme, Typography } from "antd";
import { BarSize } from "@/app/dashboard/layout_client";
import ZoomPanel from "@/components/builder/panel/zoom/ZoomPanel";
import Header from "./header";
import { ProjectRole } from "@/types/project";
import { apiWithAuth } from "@/utils/axios";
import { AutoCertChangeType } from "@/components/builder/hooks/useAutoCertChange";

interface ProjectBuilderProps {
  projectId: string;
}

export default function Builder({ projectId }: ProjectBuilderProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const [pdfFile, setPdfFile] = useState<string>("/certificate_merged.pdf");
  const roles = [ProjectRole.Requestor];
  // const [pdfFile, setPdfFile] = useState<string>("/certificate.pdf");
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
    onAnnotateDragStop,
    onAnnotateResizeStop,
    onAnnotateSelect,
    onDocumentLoadSuccess,
    onGenerateCertificates,
    onPageClick,

    rows,
    columns,
    onRowAdd,
    onRowUpdate,
    onRowsDelete,
    onColumnAdd,
    onColumnDelete,
    onAutoCertTableColumnTitleUpdate,
    onImportFromCSV,
    onExportToCSV,
  } = useAutoCert({
    roles,
    projectId,
    initialPdfPage: 1,
    // TOOD: update change
    saveChanges: async (changes) => {
      const formData = new FormData();

      // Prepare an array to include in the form's "events" field.
      // Here we make a deep copy of changes, but remove the csvFile property
      // from TableUpdate events to avoid issues with JSON.stringify.
      const changesWithoutFiles = changes.map((change) => {
        if (change.type === AutoCertChangeType.TableUpdate) {
          return {
            ...change,
            data: {
              ...change.data,
              csvFile: undefined,
            },
          };
        }
        return change;
      });

      // Append the events field as JSON string.
      formData.append("events", JSON.stringify(changesWithoutFiles));

      changes.forEach((change, index) => {
        if (
          change.type === AutoCertChangeType.TableUpdate &&
          change.data.csvFile
        ) {
          formData.append("csvFile", change.data.csvFile);
        }
      });

      console.log("saveChanges to backend", changes);
      try {
        const res = await apiWithAuth.patchForm(
          "/api/v1/projects/306696da-9f29-409b-b8bf-a494f3238e44/builder",
          formData,
        );
        console.log("saveChanges res", res.data);
      } catch (error: any) {
        console.error("Error saving changes:", error.response.data);
        // Handle error (e.g., show a notification)
        return false;
      }

      return true;
    },
  });

  if (!pdfFile) {
    return <PdfUploader setPdfFile={setPdfFile} />;
  }

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
        <Header />
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
            roles={roles}
            transformWrapperRef={transformWrapperRef}
            zoomScale={zoomScale}
            onZoomScaleChange={onZoomScaleChange}
            onPageClick={onPageClick}
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
          signatureAnnotates={signatureAnnotates}
          columns={columns}
          rows={rows}
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
          onAnnotateSelect={onAnnotateSelect}
        />
      </Splitter.Panel>
    </Splitter>
  );
}
