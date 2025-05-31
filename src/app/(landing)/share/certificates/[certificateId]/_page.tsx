"use client";
import { Button, Row, Col, Card, Space, Typography, Divider } from "antd";
import {
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  SafetyCertificateOutlined as CertificateOutlined,
} from "@ant-design/icons";
import { APP_NAME } from "@/utils";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import PdfViewer from "@/components/pdf/PdfViewer";
import moment from "moment";

const { Title, Paragraph } = Typography;

interface ProjectBuilderByIdPageProps {
  params: Promise<{ certificateId: string }>;
}

export default function CertificateSharePage({
  params,
}: ProjectBuilderByIdPageProps) {
  const [certificateId, setCertificateId] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [certificateExists, setCertificateExists] = useState<boolean | null>(
    null,
  );

  // Set PDF URL - replace with actual certificate URL logic
  const pdfUrl =
    "http://172.17.0.1:9000/autocert/projects/b083154a-e4fa-4d6c-ac39-0e71d73847b8/generated/certificate_2.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=xFBpwcax2yuNALVXzHFk%2F20250531%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250531T105631Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=831fcb0a6106856fc0f191cfe0494de35c10764b7249f4e39103ac04d81ece22";

  useEffect(() => {
    const initializePage = async () => {
      try {
        const resolvedParams = await params;
        setCertificateId(resolvedParams.certificateId);

        // TODO: Add logic to check if certificate exists
        // For now, simulate certificate existence check
        const exists = checkCertificateExists(resolvedParams.certificateId);
        setCertificateExists(exists);
      } catch (error) {
        console.error("Error initializing page:", error);
        setCertificateExists(false);
      }
    };

    initializePage();
  }, [params]);

  const checkCertificateExists = (id: string): boolean => {
    // TODO: Implement actual certificate existence check
    // Return false for demo purposes - change this logic
    return pdfUrl !== ""; // Return true if pdfUrl exists
  };

  if (certificateExists === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <CertificateOutlined className="text-4xl text-blue-600 mb-4" />
          <Title level={4} className="text-gray-700">
            Loading certificate...
          </Title>
        </div>
      </div>
    );
  }

  //   if (!certificateExists) {
  //     return notFound();
  //   }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Implement download logic here
      if (pdfUrl) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Implement print logic here
      if (pdfUrl) {
        const printWindow = window.open(pdfUrl, "_blank");
        printWindow?.print();
      }
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate from ${APP_NAME}`,
          text: "Check out this certificate",
          url: currentUrl,
        });
      } catch (error) {
        console.error("Share failed:", error);
        // Fallback to clipboard
        navigator.clipboard.writeText(currentUrl);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(currentUrl);
      // You could add a toast notification here
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          {/* PDF Viewer Column */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm border-gray-200">
              {/* <div className="mb-4">
                <Title level={3} className="text-gray-800 mb-2">
                  Certificate Preview
                </Title>
                <Paragraph className="text-gray-600 mb-4">
                  View and interact with your certificate below
                </Paragraph>
              </div> */}

              <PdfViewer pdfUrl={pdfUrl} />
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
                  onClick={handleDownload}
                  loading={isDownloading}
                  className="w-full h-12 text-base font-medium"
                  disabled={!pdfUrl}
                >
                  Download
                </Button>

                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                  loading={isPrinting}
                  className="w-full h-12 text-base font-medium"
                  disabled={!pdfUrl}
                >
                  Print
                </Button>

                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
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
                      {certificateId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs md:text-sm">
                      Issued by:
                    </span>
                    <span className="text-gray-800 font-medium text-xs md:text-sm">
                      {"lifegoalcs@gmail.com"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs md:text-sm">
                      Date Issued:
                    </span>
                    <span className="text-gray-800 font-medium text-xs md:text-sm">
                      {moment().format("MMMM Do, YYYY")}
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
                  certificate, please contact support or try refreshing the
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
