"use client";
import AutoCert, { AutoCertPanel } from "@/components/builder/AutoCert";
import { useAutoCert } from "@/hooks/useAutoCert";
import { useMemo } from "react";
import PdfUploader from "./pdf_uploader";
import { Flex, Splitter, theme } from "antd";
import { BarSize } from "@/app/dashboard/layout_client";
import ZoomPanel from "@/components/builder/panel/zoom/ZoomPanel";
import Header from "./header";
import { apiWithAuth } from "@/utils/axios";
import { AutoCertChangeType } from "@/components/builder/hooks/useAutoCertChange";
import { z } from "zod";
import { getProjectByIdSuccessResponseSchema } from "./schema";
import {
  AnnotateStates,
  ColumnAnnotateStates,
  SignatureAnnotateStates,
} from "@/components/builder/hooks/useAutoCertAnnotate";

interface ProjectBuilderProps
  extends z.infer<typeof getProjectByIdSuccessResponseSchema> {}

export default function Builder({ project, roles }: ProjectBuilderProps) {
  const { annot } = useMemo(() => {
    const sigAnnot: SignatureAnnotateStates = {};
    const colAnnot: ColumnAnnotateStates = {};
    const annot: AnnotateStates = {};

    if (project.signatureAnnotates) {
      for (const sig of project.signatureAnnotates) {
        sigAnnot[sig.page] = [
          ...(sigAnnot[sig.page] || []),
          {
            ...sig,
            type: "signature",
            signatureData: "",
            status: sig.status,
          },
        ];
        annot[sig.page] = [
          ...(annot[sig.page] || []),
          {
            ...sig,
            type: "signature",
            signatureData: "",
            status: sig.status,
          },
        ];
      }
    }

    if (project.columnAnnotates) {
      for (const col of project.columnAnnotates) {
        colAnnot[col.page] = [
          ...(colAnnot[col.page] || []),
          {
            ...col,
            type: "column",
          },
        ];
        annot[col.page] = [
          ...(annot[col.page] || []),
          {
            ...col,
            type: "column",
          },
        ];
      }
    }

    return { sigAnnot, colAnnot, annot };
  }, [project.signatureAnnotates, project.columnAnnotates]);

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
  } = useAutoCert({
    roles,
    projectId: project.id,
    initialPdfPage: 1,
    initialAnnotates: annot,
    initialSettings: {
      qrCodeEnabled: project.embedQr,
    },
    csvFileUrl: project.csvFileUrl,
    // TOOD: update change
    saveChanges: async (changes) => {
      const formData = new FormData();

      // TODO: Optimzie this
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
        const res = await apiWithAuth.putForm(
          `/api/v1/projects/${project.id}/builder`,
          formData,
        );

        console.log("saveChanges res", res.data);

        if (!res.data.success) {
          return false;
        }

        return true;
      } catch (error: any) {
        console.error("Error saving changes:", error.response.data);
        // Handle error (e.g., show a notification)
        return false;
      }
    },
  });

  // if (!pdfFile) {
  //   return <PdfUploader setPdfFile={setPdfFile} />;
  // }

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
            pdfFile={project.templateUrl}
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
          onAnnotateSelect={onAnnotateSelect}
        />
      </Splitter.Panel>
    </Splitter>
  );
}
