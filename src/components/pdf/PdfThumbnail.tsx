"use client";

import { useState, useEffect } from "react";
import { Flex, Skeleton } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Image from "next/image";
import { IMAGE_PLACEHOLDER } from "@/utils/image";
import { useInView } from "react-intersection-observer";
import { cn } from "@/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfThumbnailProps {
  pdfUrl: string | File | null;
  skeletonClassName?: string;
}

const pageNumber = 1;

export default function PdfThumbnail({
  pdfUrl,
  skeletonClassName,
}: PdfThumbnailProps) {
  const [pdfUrlOnce, setPdfUrlOnce] = useState<string | File | null>(pdfUrl);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Prevent page render before loading the pdf
  // Ref: https://github.com/wojtekmaj/react-pdf/issues/974
  useEffect(() => {
    if (pdfUrl) {
      setPdfPages(0);
    }
  }, [pdfUrl]);

  // Render only once when the component mounts since thumbnail is static
  useEffect(() => {
    if (pdfUrl) {
      setPdfUrlOnce(pdfUrl);
    }
  }, []);

  return (
    <div ref={ref} className="relative overflow-hidden h-full w-full">
      {/* Key must change every refresh, since we use presigned url, using certificateUrl is ok
            Ref: https://github.com/wojtekmaj/react-pdf/issues/974#issuecomment-2758494216 */}
      <Document
        key={
          typeof pdfUrlOnce === "string"
            ? pdfUrlOnce
            : pdfUrlOnce instanceof File
              ? pdfUrlOnce.name + pdfUrlOnce.size + pdfUrlOnce.lastModified
              : "no-pdf"
        }
        className={"w-full h-full"}
        file={pdfUrlOnce}
        onLoadSuccess={(pdf) => {
          setPdfPages(pdf.numPages);
        }}
        loading={<DocumentLoading skeletonClassName={skeletonClassName} />}
        error={<PageError />}
      >
        {inView && (
          <Page
            key={`page_${pageNumber}`}
            _className="max-h-full w-full h-auto object-cover"
            className="pointer-events-none select-none"
            scale={1}
            loading={<DocumentLoading skeletonClassName={skeletonClassName} />}
            error={<PageError />}
            noData={<PageError />}
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
        )}
      </Document>
    </div>
  );
}

function PageError() {
  return (
    <Image
      src={IMAGE_PLACEHOLDER}
      fill
      alt="Error loading PDF"
      className="w-full h-full object-cover"
    />
  );
}

type DocumentLoadingProps = Pick<PdfThumbnailProps, "skeletonClassName">;

function DocumentLoading({ skeletonClassName }: DocumentLoadingProps) {
  return (
    <Skeleton.Image
      active
      className={cn("w-full h-full object-cover", skeletonClassName)}
    />
  );
}
