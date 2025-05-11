"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Space, Flex, Typography, Spin, App, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Certificate } from "./certificate_list";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PdfDocumentError from "@/components/error/PdfDocumentError";
import Zoom from "@/components/builder/zoom/Zoom";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import ZoomPanel from "@/components/builder/panel/zoom/ZoomPanel";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const { Text } = Typography;

interface CertificateViewerProps {
  certificate: Certificate;
}

// TODO: Implement the actual PDF viewer logic
export function CertificateViewer({ certificate }: CertificateViewerProps) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onZoomScaleChange = (newZoomScale: number): void => {
    if (zoomScale === newZoomScale) {
      return;
    }

    setZoomScale(newZoomScale);
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < pdfPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Prevent page render before loading the pdf
  // Ref: https://github.com/wojtekmaj/react-pdf/issues/974
  useEffect(() => {
    if (certificate.certificateUrl) {
      setPdfPages(0);
      setIsLoading(true);
    }
  }, [certificate.certificateUrl]);

  return (
    <Space direction="vertical" className="h-auto w-full">
      <Flex justify="space-between" align="center">
        <Space align="center">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevPage}
            disabled={pageNumber === 1 || isLoading}
          />

          {isLoading ? (
            <Skeleton.Input active />
          ) : (
            <Text>{`Page ${pageNumber} of ${pdfPages}`}</Text>
          )}

          <Button
            icon={<RightOutlined />}
            onClick={handleNextPage}
            disabled={pageNumber === pdfPages || isLoading}
          />
        </Space>
        <ZoomPanel
          transformWrapperRef={transformWrapperRef}
          zoomScale={zoomScale}
        />
      </Flex>

      <Flex
        align="center"
        justify="center"
        className="relative bg-gray-100 overflow-auto h-full w-full"
      >
        <Zoom
          transformWrapperRef={transformWrapperRef}
          onZoomScaleChange={onZoomScaleChange}
        >
          {/* Key must change every refresh, since we use presigned url, using certificateUrl is ok
            Ref: https://github.com/wojtekmaj/react-pdf/issues/974#issuecomment-2758494216 */}
          <Document
            key={certificate.certificateUrl}
            file={certificate.certificateUrl}
            onLoadSuccess={(pdf) => {
              setPdfPages(pdf.numPages);
              setIsLoading(false);
            }}
            loading={<DocumentLoading />}
            error={<PdfDocumentError />}
          >
            <Page
              key={`page_${pageNumber}`}
              _className="max-h-full w-full h-auto object-cover"
              className="pointer-events-none select-none"
              scale={2}
              loading={<DocumentLoading />}
              pageNumber={pageNumber}
              canvasRef={(ref) => {
                if (ref) {
                  const ctx = ref.getContext("2d");
                  if (ctx) {
                    ctx.imageSmoothingEnabled = false;
                  }
                }
              }}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </Zoom>
      </Flex>
    </Space>
  );
}

function DocumentLoading() {
  return <Skeleton.Image active className="w-full h-full min-w-40 min-h-40" />;
}
