import { createScopedLogger } from "@/utils/logger";
import { useEffect, useRef, useState } from "react";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { IS_PRODUCTION } from "@/utils/env";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { SettingsToolProps } from "../panel/tool/settings/settings";
import useAutoCertChange, {
  AutoCertChangeEvent,
  AutoCertChangeType,
  UseAutoCertChangeProps,
} from "./useAutoCertChange";
import useAutoCertAnnotate, {
  AnnotateStates,
  UseAutoCertAnnotateProps,
} from "./useAutoCertAnnotate";
import useAutoCertTable, { UseAutoCertTableProps } from "./useAutoCertTable";
import {
  AutoCertTableColumn,
  AutoCertTableRow,
} from "../panel/table/AutoCertTable";
import { ProjectRole } from "@/types/project";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { App } from "antd";

const logger = createScopedLogger("components:builder:hook:useAutoCert");

export type AutoCertSettings = Pick<SettingsToolProps, "qrCodeEnabled"> & {};

export interface UseAutoCertProps extends UseAutoCertChangeProps {
  roles: ProjectRole[];
  initialPdfPage: number;
  initialAnnotates: AnnotateStates;
  initialSettings?: AutoCertSettings;
  projectId: string;
  csvFileUrl: string;
  tableTestConfig?: {
    rows: AutoCertTableRow[];
    columns: AutoCertTableColumn[];
  };
  saveChanges: (changes: AutoCertChangeEvent[]) => Promise<boolean>;
}

export default function useAutoCert({
  projectId,
  initialPdfPage = 1,
  initialAnnotates = [],
  initialSettings = {
    qrCodeEnabled: false,
  } satisfies AutoCertSettings,
  csvFileUrl,
  tableTestConfig,
  roles,
  saveChanges,
}: UseAutoCertProps) {
  const [totalPdfPage, setTotalPdfPage] = useState<number>(0);
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(initialPdfPage);
  const { message } = App.useApp();
  // For zoom pan and pinch
  const [zoomScale, setZoomScale] = useState<number>(1);
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const [settings, setSettings] = useState<AutoCertSettings>({
    ...initialSettings,
  });
  const { changes, enqueueChange, isPushingChanges } = useAutoCertChange({
    saveChanges,
  });

  const {
    annotates,
    columnAnnotates,
    signatureAnnotates,
    selectedAnnotateId,
    onColumnAnnotateAdd,
    onColumnAnnotateUpdate,
    onColumnAnnotateRemove,
    onSignatureAnnotateAdd,
    onSignatureAnnotateRemove,
    onSignatureAnnotateInvite,
    onAnnotateResizeStop,
    onAnnotateDragStop,
    onAnnotateSelect,
    replaceAnnotatesColumnValue,
    removeUnnecessaryAnnotates,
  } = useAutoCertAnnotate({
    initialAnnotates,
    roles,
    enqueueChange,
  });

  const {
    rows,
    columns,
    tableLoading,
    initialCSVParsed,
    onRowAdd,
    onRowUpdate,
    onRowsDelete,
    onColumnAdd,
    onColumnDelete,
    onColumnUpdate,
    onImportFromCSV,
    onExportToCSV,
  } = useAutoCertTable({
    roles,
    projectId,
    csvFileUrl,
    tableTestConfig,
    enqueueChange,
  });

  useEffect(() => {
    if (!initialCSVParsed) {
      logger.debug("Initial CSV parsed, skip remove unnecessary annotates");
      return;
    }

    removeUnnecessaryAnnotates(columns);
  }, [columns, initialCSVParsed]);

  const onPageClick = (page: number): void => {
    setCurrentPdfPage(page);
  };

  const onZoomScaleChange = (newZoomScale: number): void => {
    if (zoomScale === newZoomScale) {
      // logger.debug(`Zoom scale not changed: ${zoomScale} skip state update`);
      return;
    }

    setZoomScale(newZoomScale);
  };

  const onDocumentLoadSuccess = async (
    pdf: DocumentCallback,
  ): Promise<void> => {
    logger.debug(`Pdf loaded, total pages: ${pdf.numPages}`);

    setTotalPdfPage(pdf.numPages);
    setCurrentPdfPage(initialPdfPage);

    if (!IS_PRODUCTION) {
      const page = await pdf.getPage(1);
      const width = page.view[2];
      const height = page.view[3];
      logger.debug(`Pdf width: ${width}, height: ${height}`);
    }
  };

  const onGenerateCertificates = (): void => {
    console.log(annotates);
  };

  const onQrCodeEnabledChange: SettingsToolProps["onQrCodeEnabledChange"] = (
    enabled: boolean,
  ): void => {
    logger.debug(`QR code enabled: ${enabled}`);

    if (!hasPermission(roles, [ProjectPermission.SettingsUpdate])) {
      logger.warn("Permission denied to update settings (Embed QR code)");
      message.error("You do not have permission to update settings");
      return;
    }

    setSettings(
      (prev) =>
        ({
          ...prev,
          qrCodeEnabled: enabled,
        }) satisfies AutoCertSettings,
    );

    enqueueChange({
      type: AutoCertChangeType.SettingsUpdate,
      data: {
        qrCodeEnabled: enabled,
      },
    });
  };

  const onAutoCertTableColumnTitleUpdate = (
    oldTitle: string,
    newTitle: string,
  ): void => {
    if (!hasPermission(roles, [ProjectPermission.TableUpdate])) {
      logger.warn("Permission denied to update column title");
      message.error("You do not have permission to update table");
      return;
    }

    onColumnUpdate(oldTitle, newTitle);
    replaceAnnotatesColumnValue(oldTitle, newTitle);
  };

  return {
    annotates,
    columnAnnotates,
    signatureAnnotates,
    selectedAnnotateId,
    currentPdfPage,
    totalPdfPage,
    transformWrapperRef,
    zoomScale,
    settings,
    onZoomScaleChange,
    onDocumentLoadSuccess,
    onPageClick,
    onColumnAnnotateAdd,
    onColumnAnnotateUpdate,
    onColumnAnnotateRemove,
    onSignatureAnnotateAdd,
    onSignatureAnnotateRemove,
    onSignatureAnnotateInvite,
    onAnnotateResizeStop,
    onAnnotateDragStop,
    onAnnotateSelect,
    onGenerateCertificates,
    onQrCodeEnabledChange,

    // Table
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
  };
}
