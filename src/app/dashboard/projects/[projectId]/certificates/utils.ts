import { createScopedLogger } from "@/utils/logger";
import { Certificate } from "./certificate_list";
import { MessageInstance } from "antd/es/message/interface";
import { api, apiWithAuth } from "@/utils/axios";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:utils",
);

export const getMergedCertificateObjectUrl = async (
  projectId: string,
): Promise<string> => {
  logger.info(`Merging certificates for project id: ${projectId}`);
  try {
    const res = await apiWithAuth.get(
      `api/v1/projects/${projectId}/certificates/merge`,
      {
        responseType: "blob",
      },
    );
    if (res.status !== 200) {
      throw new Error("Get merged certificates however response is not 200");
    }

    const blob = res.data;
    const url = window.URL.createObjectURL(blob);
    return url;
  } catch (error) {
    logger.error("Failed to merge certificates", error);
    throw new Error("Failed to merge certificates");
  }
};

export const downloadCertificate = async (
  certificate: Certificate,
  message: MessageInstance,
): Promise<void> => {
  logger.info(
    `Downloading certificate id: ${certificate.id}, number: ${certificate.number}`,
  );

  try {
    const res = await api.get(certificate.certificateUrl, {
      responseType: "blob",
    });
    if (res.status !== 200) {
      throw new Error("Get certificate however response is not 200");
    }
    const blob = new Blob([res.data]);
    const filename = `certificate-${certificate.number}.pdf`;
    download(blob, filename);
  } catch (error) {
    logger.error("Failed to download certificate", error);
    message.error(
      `Failed to download certificate number ${certificate.number}`,
    );
  }
};

export const downloadAllCertificates = async (
  projectId: string,
  message: MessageInstance,
): Promise<void> => {
  logger.info(`Downloading all certificates for project id: ${projectId}`);
  try {
    const res = await apiWithAuth.get(
      `api/v1/projects/${projectId}/certificates/download`,
      {
        responseType: "blob",
      },
    );

    if (res.status !== 200) {
      throw new Error("Get certificates zip however response is not 200");
    }

    const blob = new Blob([res.data]);
    const filename = `certificates.zip`;
    download(blob, filename);
  } catch (error) {
    logger.error("Failed to download all certificates", error);
    message.error("Failed to download all certificates");
  }
};

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

export const toCertificateTitle = (certificate: Certificate): string => {
  return `Certificate No. ${certificate.number}`;
};
