"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  Button,
  Badge,
  Tabs,
  Tooltip,
  Modal,
  Row,
  Col,
  Typography,
  Space,
  List,
  Avatar,
  Flex,
  App,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  LinkOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { CertificateViewer } from "./certificate_viewer";
import {
  Certificate,
  downloadCertificate,
  generateShareableLink,
} from "./temp";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface CertificateListProps {
  certificates: Certificate[];
}

export default function CertificateList({
  certificates,
}: CertificateListProps) {
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const { message } = App.useApp();
  const [viewMode, setViewMode] = useState<string>("grid");
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleShareLink = async (id: string) => {
    const link = await generateShareableLink(id);
    navigator.clipboard.writeText(link);
    message.success("Link copied to clipboard");
  };

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {certificates.map((certificate) => (
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
            <Flex
              justify="space-between"
              align="start"
              style={{ marginBottom: 8 }}
            >
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
                <Text type="secondary" text-ellipsis>
                  {certificate.issueDate}
                </Text>
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
                    onClick={() => handleShareLink(certificate.id)}
                  />
                </Tooltip>

                <Tooltip title="View Certificate">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedCertificate(certificate);
                      setIsViewerOpen(true);
                    }}
                  />
                </Tooltip>

                <Tooltip title="Download Certificate">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => downloadCertificate(certificate.id)}
                  />
                </Tooltip>
              </Space>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={certificates}
      renderItem={(certificate) => (
        <List.Item
          key={certificate.id}
          actions={[
            <Button
              key="share"
              icon={<LinkOutlined />}
              onClick={() => handleShareLink(certificate.id)}
            >
              Share
            </Button>,
            <Button
              key="view"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCertificate(certificate);
                setIsViewerOpen(true);
              }}
            >
              View
            </Button>,
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => downloadCertificate(certificate.id)}
            >
              Download
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                shape="square"
                size={64}
                src={certificate.thumbnailUrl || "/placeholder.svg"}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setIsViewerOpen(true);
                }}
              />
            }
            title={
              <Flex align="center" gap={8}>
                <Text
                  strong
                  className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                >
                  {certificate.name}
                </Text>
                {/* {getStatusBadge(certificate.status)} */}
              </Flex>
            }
            description={
              <Space size={16}>
                <Flex align="center" gap={4}>
                  <CalendarOutlined />
                  <Text type="secondary">{certificate.issueDate}</Text>
                </Flex>
                <Flex align="center" gap={4}>
                  <UserOutlined />
                  <Text type="secondary">{certificate.recipient}</Text>
                </Flex>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          {certificates.length} Certificate
          {certificates.length !== 1 ? "s" : ""}
        </Title>
        <Tabs
          defaultActiveKey="grid"
          onChange={(key) => setViewMode(key)}
          size="small"
          items={[
            {
              key: "grid",
              label: "Grid",
            },
            {
              key: "list",
              label: "List",
            },
          ]}
        />
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
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderListView()
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
