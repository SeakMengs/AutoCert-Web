import { createScopedLogger } from "@/utils/logger";
import { Certificate } from "./certificate_list";
import { MessageInstance } from "antd/es/message/interface";
import { api, apiWithAuth } from "@/utils/axios";
import { z } from "zod";
import { ProjectLogSchema } from "@/schemas/autocert_api/project";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:utils",
);

const download = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadFromUrl = async (
  url: string,
  filename: string,
): Promise<void> => {
  const res = await fetch(url);
  const blob = await res.blob();
  if (!res.ok) {
    logger.error("Failed to download file", { url, status: res.status });
    throw new Error(`Failed to download file: ${res.statusText}`);
  }
  download(blob, filename);
};

export const toCertificateTitle = (certificate: Certificate): string => {
  return `Certificate No. ${certificate.number}`;
};

export const exportActivityLogToCSV = (
  activityLog: z.infer<typeof ProjectLogSchema>[],
  title: string,
): void => {
  const headers = ["userEmail", "action", "description", "timestamp"];
  const csvRows = activityLog.map((log) => [
    log.role,
    log.action,
    log.description,
    log.timestamp,
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  download(blob, `${title}-activity-log.csv`);
};
