import { createScopedLogger } from "@/utils/logger";
import { Certificate } from "./certificate_list";
import { MessageInstance } from "antd/es/message/interface";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:utils",
);

export const downloadCertificate = async (
  certificate: Certificate,
  message: MessageInstance,
): Promise<void> => {
  logger.info(
    `Downloading certificate id: ${certificate.id}, number: ${certificate.number}`,
  );

  try {
    const response = await fetch(certificate.certificateUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch the certificate");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate_${certificate.number}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    logger.error("Failed to download certificate", error);
    message.error(
      `Failed to download certificate number ${certificate.number}`,
    );
  }
};

export const toCertificateTitle = (certificate: Certificate): string => {
  return `Certificate No. ${certificate.number}`;
};
