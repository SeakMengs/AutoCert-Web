"use client";

import { useState, useEffect } from "react";
import { Button, Space, Flex, Typography, Spin } from "antd";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Certificate, downloadCertificate } from "./temp";

const { Text } = Typography;

interface CertificateViewerProps {
  certificate: Certificate;
}

export function CertificateViewer({ certificate }: CertificateViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, you would load the PDF and get the total pages
    // For this example, we'll simulate a loading delay and set a random number of pages
    const timer = setTimeout(() => {
      setTotalPages(Math.floor(Math.random() * 3) + 1);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [certificate.id]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 2) {
      setZoom(zoom + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom(zoom - 0.1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Flex justify="space-between" align="center">
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
          />

          <Text>
            {isLoading ? "Loading..." : `Page ${currentPage} of ${totalPages}`}
          </Text>

          <Button
            icon={<RightOutlined />}
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
          />
        </Space>

        <Space>
          <Button
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={zoom <= 0.5 || isLoading}
          />

          <Text style={{ width: 60, textAlign: "center" }}>
            {isLoading ? "..." : `${Math.round(zoom * 100)}%`}
          </Text>

          <Button
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={zoom >= 2 || isLoading}
          />

          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadCertificate(certificate.id)}
            disabled={isLoading}
          >
            Download
          </Button>
        </Space>
      </Flex>

      <div
        style={{
          position: "relative",
          background: "#f5f5f5",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "70vh",
        }}
      >
        {isLoading ? (
          <Spin />
        ) : (
          <div
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 0.2s",
              overflow: "auto",
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={certificate.pdfUrl || certificate.thumbnailUrl}
              alt={certificate.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
