"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "antd";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { pdfjs } from "react-pdf";
import { cn } from "@/utils";
import { IMAGE_PLACEHOLDER } from "@/utils/image";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("src:components:pdf:PdfThumbnail");

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfThumbnailProps {
  pdfUrl: string | URL | undefined;
  skeletonClassName?: string;
}

const pageNumber = 1;

export default function PdfThumbnail({
  pdfUrl,
  skeletonClassName,
}: PdfThumbnailProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Render only once when the component mounts since thumbnail is static
  useEffect(() => {
    if (!pdfUrl || !inView) return;

    const renderPageToImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const pdf = await pdfjs.getDocument(pdfUrl).promise.catch((err) => {
          logger.error("Error loading PDF document", err);
          throw new Error("Failed to load PDF document");
        });
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Failed to get canvas context");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/png");
        setImageDataUrl(dataUrl);
      } catch (e) {
        logger.error("Error rendering PDF page to image", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    renderPageToImage();

    return () => {
      if (imageDataUrl) {
        URL.revokeObjectURL(imageDataUrl);
        setImageDataUrl(null);
      }
      setError(false);
      setLoading(false);
    };
  }, [inView]);

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      {loading && <DocumentLoading skeletonClassName={skeletonClassName} />}
      {!loading && error && <PageError />}
      {!loading && !error && imageDataUrl && (
        <Image
          src={imageDataUrl}
          alt="PDF Thumbnail"
          className="w-full h-full object-cover pointer-events-none select-none"
          fill
        />
      )}
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
      className={cn("w-full h-auto object-cover", skeletonClassName)}
    />
  );
}
