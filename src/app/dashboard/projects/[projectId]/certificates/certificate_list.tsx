"use client";

import { useState } from "react";
import Image from "next/image";
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
  Skeleton,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  LinkOutlined,
  CalendarOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { CertificateViewer } from "./certificate_viewer";
import { generateShareableLink } from "./temp";
import usePrint from "@/hooks/usePrint";
import { z } from "zod";
import { getCertificatesByProjectIdSuccessResponseSchema } from "./schema";
import moment from "moment";
import { createScopedLogger } from "@/utils/logger";
import { downloadCertificate, toCertificateTitle } from "./utils";
import { useMutation } from "@tanstack/react-query";
import { useImageSrc } from "@/hooks/useImageSrc";
import { cn } from "@/utils";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:certificate_list",
);

const { Title, Text } = Typography;

export type Certificate = z.infer<
  typeof getCertificatesByProjectIdSuccessResponseSchema
>["project"]["certificates"][number];

export interface CertificateListProps {
  certificates: Certificate[];
  projectId: string;
}

export default function CertificateList({
  projectId,
  certificates,
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
          {certificates.length} Certificate
          {certificates.length !== 1 ? "s" : ""}
        </Title>
      </Flex>

      {certificates.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <Text type="secondary">No certificate</Text>
        </div>
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
          <CertificateViewer certificate={selectedCertificate} />
        </Modal>
      )}
    </div>
  );
}

interface GridViewProps {
  certificate: Certificate;
  projectId: string;
  onCertificateView: (certificate: Certificate) => void;
}

function GridView({
  projectId,
  certificate,
  onCertificateView,
}: GridViewProps) {
  const { src, loading, onLoadStart, onLoadingComplete, onError } = useImageSrc(
    `/api/proxy/projects/${projectId}/certificates/${certificate.number}/thumbnail`,
  );
  const { message } = App.useApp();
  const { onPrint, printLoading, setPrintLoading } = usePrint();

  // TODO: add actual link
  const onGetShareableLink = async (id: string) => {
    logger.info("Generating shareable link for certificate", id);

    const link = await generateShareableLink(id);
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard");
  };

  const onPrintPdf = async (pdfUrl: string) => {
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

  const {
    mutateAsync: onDownloadCertificateMutation,
    isPending: isDownloading,
  } = useMutation({
    mutationFn: async () => await downloadCertificate(certificate, message),
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
            <Image
              className={cn("rounded-sm object-cover w-full", {
                "opacity-0": loading,
              })}
              alt={toCertificateTitle(certificate)}
              src={src}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onError={onError}
              onLoadStart={onLoadStart}
              onLoad={onLoadingComplete}
            />
            {loading && (
              <div className="absolute inset-0 z-10">
                <Skeleton.Image
                  active
                  className={cn("rounded-sm object-cover w-full h-full")}
                />
              </div>
            )}
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
            <Tooltip title="Copy Shareable Link">
              <Button
                icon={<LinkOutlined />}
                onClick={async () => await onGetShareableLink(certificate.id)}
              />
            </Tooltip>

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
                onClick={async () => onDownloadCertificateMutation()}
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
              />
            </Tooltip>
          </Space>
        </Flex>
      </Card>
    </Col>
  );
}
