"use client";
import { Button, Row, Col, Card, Space, Divider, Typography, App } from "antd";
import {
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  SafetyCertificateOutlined as CertificateOutlined,
} from "@ant-design/icons";
import PdfViewer from "@/components/pdf/PdfViewer";
import moment from "moment";
import { z } from "zod";
import { getCertificateByIdSuccessResponseSchema } from "./schema";
import { useMutation } from "@tanstack/react-query";
import { createScopedLogger } from "@/utils/logger";
import usePrint from "@/hooks/usePrint";
import { DOMAIN } from "@/utils";
import { downloadFromUrl } from "@/app/dashboard/projects/[projectId]/certificates/utils";

const logger = createScopedLogger(
  "src:app:(landing):share:certificates:[certificateId]:certificate_content.tsx",
);

interface CertificateContentProps {
  certificate: z.infer<typeof getCertificateByIdSuccessResponseSchema>;
}

const { Title } = Typography;

export default function CertificateContent({
  certificate,
}: CertificateContentProps) {
  const { message } = App.useApp();

  const { onPrint, printLoading, setPrintLoading } = usePrint();

  const onGetShareableLink = (id: string): void => {
    logger.info("Get shareable link for certificate", certificate.id);
    const link = `${DOMAIN}/share/certificates/${id}`;

    try {
      navigator.clipboard.writeText(link);
      message.success("Link copied to clipboard");
    } catch (error) {
      logger.error("Failed to copy link to clipboard", error);
      message.warning(
        `Failed to copy link to clipboard. Please copy manually: ${link}`,
      );
    }
  };

  const onPrintPdf = async (pdfUrl: string): Promise<void> => {
    try {
      setPrintLoading(true);
      logger.info("Printing certificate", pdfUrl);

      await onPrint({
        printable: pdfUrl,
        type: "pdf",
        onLoadingEnd() {
          message.success("Certificate is ready to print");
        },
        onError(err) {
          message.error("Error printing certificate");
          logger.error("Error printing certificate", err);
        },
      });
    } catch (error) {
      message.error("Error printing certificate");
      logger.error("Error printing certificate", error);
    } finally {
      setPrintLoading(false);
    }
  };

  const { mutateAsync: onDownloadCertificate, isPending: isDownloading } =
    useMutation({
      mutationFn: async (): Promise<void> => {
        await downloadFromUrl(
          certificate.certificateUrl,
          `certificate-${certificate.number}.pdf`,
        );
      },
      onError: (error) => {
        logger.error("Failed to download certificate", error);
        message.error(
          `Failed to download certificate number ${certificate.number}`,
        );
      },
    });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          {/* PDF Viewer Column */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm border-gray-200">
              <div className="mb-4">
                <Title level={3} className="text-gray-800 mb-2">
                  {certificate.projectTitle || "N/A"}
                </Title>
                {/* <Paragraph className="text-gray-600 mb-4">
                  View and interact with your certificate below
                </Paragraph> */}
              </div>

              <PdfViewer pdfUrl={certificate.certificateUrl} />
            </Card>
          </Col>

          {/* Actions Column */}
          <Col xs={24} lg={8}>
            <Card className="shadow-sm border-gray-200 sticky top-4">
              <Title level={4} className="text-gray-800 mb-4">
                Actions
              </Title>

              <Space direction="vertical" size="middle" className="w-full">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={async () => onDownloadCertificate()}
                  loading={isDownloading}
                  disabled={isDownloading}
                  className="w-full h-12 text-base font-medium"
                >
                  Download
                </Button>

                <Button
                  icon={<PrinterOutlined />}
                  onClick={async () =>
                    await onPrintPdf(certificate.certificateUrl)
                  }
                  loading={printLoading}
                  disabled={!certificate.certificateUrl || printLoading}
                  className="w-full h-12 text-base font-medium"
                >
                  Print
                </Button>

                <Button
                  icon={<ShareAltOutlined />}
                  onClick={() => onGetShareableLink(certificate.id)}
                  className="w-full h-12 text-base font-medium"
                >
                  Share
                </Button>
              </Space>

              <Divider className="my-6" />

              <div className="space-y-3">
                <Title
                  level={5}
                  className="text-gray-700 mb-3 !text-base md:!text-lg"
                >
                  Certificate Details
                </Title>
                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600 truncate max-w-[50%] text-xs md:text-sm">
                      Certificate ID:
                    </span>
                    <span className="text-gray-800 font-medium break-all text-xs md:text-sm">
                      {certificate.id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs md:text-sm">
                      Issued by:
                    </span>
                    <span className="text-gray-800 font-medium text-xs md:text-sm">
                      {certificate.issuer || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs md:text-sm">
                      Date Issued:
                    </span>
                    <span className="text-gray-800 font-medium text-xs md:text-sm">
                      {moment(certificate.issuedAt).format("MMMM Do, YYYY")}
                    </span>
                  </div>
                </div>
              </div>

              {/* <Divider className="my-6" />

              <div className="p-4 bg-blue-50 rounded-lg">
                <Title level={5} className="text-blue-800 mb-2">
                  Need Help?
                </Title>
                <Paragraph className="text-blue-700 text-sm mb-0">
                  If you're having trouble viewing or downloading your
                  certificate, please disable internet download manager or try refreshing the
                  page.
                </Paragraph>
              </div> */}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
