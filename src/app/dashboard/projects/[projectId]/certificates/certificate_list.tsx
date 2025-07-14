"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Tooltip,
  Modal,
  Row,
  Col,
  Typography,
  Space,
  Flex,
  App,
  Empty,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  LinkOutlined,
  CalendarOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import usePrint from "@/hooks/usePrint";
import { z } from "zod";
import { getCertificatesByProjectIdSuccessResponseSchema } from "./schema";
import moment from "moment";
import { createScopedLogger } from "@/utils/logger";
import { downloadFromUrl, toCertificateTitle } from "./utils";
import { useMutation } from "@tanstack/react-query";
import { DOMAIN } from "@/utils";
import PdfViwer from "@/components/pdf/PdfViewer";
import PdfThumbnail from "@/components/pdf/PdfThumbnail";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:certificate_list",
);

const { Title, Text } = Typography;

export type Certificate = z.infer<
  typeof getCertificatesByProjectIdSuccessResponseSchema
>["project"]["certificates"][number];

export interface CertificateListProps {
  certificates: Certificate[];
  totalCertificates: number;
  projectId: string;
  page: number;
  setPage: (page: number) => void;
  isPublic: boolean;
}

export default function CertificateList({
  projectId,
  isPublic,
  page,
  certificates,
  totalCertificates,
  setPage,
}: CertificateListProps) {
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);

  const onCertificateView = (certificate: Certificate): void => {
    setSelectedCertificate(certificate);
    setIsViewerOpen(true);
  };

  const GridViews = (
    <Row gutter={[16, 16]}>
      {certificates.map((certificate) => (
        <GridView
          key={certificate.id}
          isPublic={isPublic}
          projectId={projectId}
          certificate={certificate}
          onCertificateView={onCertificateView}
        />
      ))}
    </Row>
  );

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          {totalCertificates} Certificate
          {totalCertificates !== 1 ? "s" : ""}
        </Title>
      </Flex>

      {certificates.length === 0 ? (
        <Flex vertical align="center" justify="center">
          <Empty
            description={
              page === 1 ? (
                <p className="text-muted-foreground">No certificates.</p>
              ) : (
                <Space direction="vertical" align="center">
                  <div>No certificate for page {page}</div>
                  <Button
                    type="primary"
                    onClick={() => {
                      setPage(1);
                    }}
                  >
                    Go to page 1
                  </Button>
                </Space>
              )
            }
          />
        </Flex>
      ) : (
        GridViews
      )}

      {selectedCertificate && (
        <Modal
          key={selectedCertificate.id}
          title={toCertificateTitle(selectedCertificate)}
          open={isViewerOpen}
          onCancel={() => setIsViewerOpen(false)}
          footer={null}
          width={1000}
          style={{ top: 20 }}
        >
          <PdfViwer pdfUrl={selectedCertificate.certificateUrl} />
        </Modal>
      )}
    </div>
  );
}

interface GridViewProps {
  certificate: Certificate;
  isPublic: boolean;
  projectId: string;
  onCertificateView: (certificate: Certificate) => void;
}

function GridView({
  projectId,
  isPublic,
  certificate,
  onCertificateView,
}: GridViewProps) {
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
    <Col key={certificate.id} xs={24} sm={12} md={8} lg={4}>
      <Card
        className="border rounded-sm hover:shadow-sm relative group w-full"
        hoverable
        cover={
          <div className="relative w-full h-64 sm:h-48 xs:h-36">
            <PdfThumbnail
              pdfUrl={certificate.certificateUrl}
              skeletonClassName="h-64 sm:h-48 xs:h-36"
            />
          </div>
        }
      >
        <Flex justify="space-between" align="start" style={{ marginBottom: 8 }}>
          <Text
            strong
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
          >
            Certificate No. {certificate.number}
          </Text>
        </Flex>

        <Space
          direction="vertical"
          size={4}
          style={{ marginBottom: 8, color: "rgba(0, 0, 0, 0.45)" }}
        >
          <Flex align="center" gap={8}>
            <CalendarOutlined />
            <Text type="secondary">
              {moment(certificate.createdAt).fromNow()}
            </Text>
          </Flex>
        </Space>

        <Flex justify="space-between">
          <Space>
            {isPublic && (
              <Tooltip title="Copy Shareable Link">
                <Button
                  icon={<LinkOutlined />}
                  onClick={async () => onGetShareableLink(certificate.id)}
                />
              </Tooltip>
            )}

            <Tooltip title="View Certificate">
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  onCertificateView(certificate);
                }}
              />
            </Tooltip>

            <Tooltip title="Download Certificate">
              <Button
                icon={<DownloadOutlined />}
                onClick={async () => onDownloadCertificate()}
                loading={isDownloading}
                disabled={isDownloading}
              />
            </Tooltip>
            <Tooltip title="Print Certificate">
              <Button
                icon={<PrinterOutlined />}
                onClick={async () =>
                  await onPrintPdf(certificate.certificateUrl)
                }
                loading={printLoading}
                disabled={!certificate.certificateUrl || printLoading}
              />
            </Tooltip>
          </Space>
        </Flex>
      </Card>
    </Col>
  );
}
