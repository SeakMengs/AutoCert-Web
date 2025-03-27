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
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  LinkOutlined,
  CalendarOutlined,
  UserOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { CertificateViewer } from "./certificate_viewer";
import {
  Certificate,
  downloadCertificate,
  generateShareableLink,
} from "./temp";
import usePrint from "@/hooks/usePrint";

const { Title, Text } = Typography;

interface CertificateListProps {
  certificates: Certificate[];
}

export default function CertificateList({
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
          <Text type="secondary">No certificates found</Text>
        </div>
      ) : (
        GridViews
      )}

      {selectedCertificate && (
        <>
          <Modal
            title={selectedCertificate.name}
            open={isViewerOpen}
            onCancel={() => setIsViewerOpen(false)}
            footer={null}
            width={1000}
            style={{ top: 20 }}
          >
            <CertificateViewer certificate={selectedCertificate} />
          </Modal>
        </>
      )}
    </div>
  );
}

interface GridViewProps {
  certificate: Certificate;
  onCertificateView: (certificate: Certificate) => void;
}

function GridView({ certificate, onCertificateView }: GridViewProps) {
  const { message } = App.useApp();
  const { onPrint, printLoading } = usePrint();

  const onGetShareableLink = async (id: string) => {
    const link = await generateShareableLink(id);
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard");
  };

  const onPrintPdf = async (pdfUrl: string) => {
    onPrint({
      printable: pdfUrl,
      type: "pdf",
      onLoadingEnd() {
        message.success("Certificate is ready to print");
      },
    });
  };

  return (
    <Col key={certificate.id} xs={24} sm={12} md={8} lg={4}>
      <Card
        className="border rounded-sm hover:shadow-sm relative group w-full"
        hoverable
        cover={
          <Image
            className="rounded-sm object-cover w-full h-auto"
            alt={certificate.name}
            src={certificate.thumbnailUrl || "/placeholder.svg"}
            width={256}
            height={144}
            unoptimized
          />
        }
      >
        <Flex justify="space-between" align="start" style={{ marginBottom: 8 }}>
          <Text
            strong
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
          >
            {certificate.name}
          </Text>
          {/* {getStatusBadge(certificate.status)} */}
        </Flex>

        <Space
          direction="vertical"
          size={4}
          style={{ marginBottom: 8, color: "rgba(0, 0, 0, 0.45)" }}
        >
          <Flex align="center" gap={8}>
            <CalendarOutlined />
            <Text type="secondary">{certificate.issueDate}</Text>
          </Flex>
          <Flex align="center" gap={8}>
            <UserOutlined />
            <Text type="secondary">{certificate.recipient}</Text>
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
                onClick={() => downloadCertificate(certificate.id)}
              />
            </Tooltip>
            <Tooltip title="Print Certificate">
              <Button
                icon={<PrinterOutlined />}
                onClick={async () =>
                  await onPrintPdf("/certificate_merged.pdf")
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
