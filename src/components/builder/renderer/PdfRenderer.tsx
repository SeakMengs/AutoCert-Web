"use client";
import { Document, Page, pdfjs, usePageContext } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";
import type { RenderParameters } from "pdfjs-dist/types/src/display/api.js";
import { useEffect, useMemo, useRef } from "react";
import { IS_PRODUCTION_ENV } from "@/utils";
import { createScopedLogger } from "@/utils/logger";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const logger = createScopedLogger("components:builder:renderer:PdfRenderer");

export interface PdfRendererProps extends CanvasToImageRendererProps {
    pdfFile: string;
    currentPdfPage: number;
    onDocumentLoadSuccess?: (pdf: DocumentCallback) => void;
    onPageLoadSuccess?: (page: PageCallback) => void;
}

export interface CanvasToImageRendererProps {
    // Scale of the image element, not the PDF page scale
    imageScale: number;
    setImageScale: (scale: number) => void;
}

export default function PdfRenderer({
    pdfFile,
    currentPdfPage,
    imageScale,
    setImageScale,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
}: PdfRendererProps) {
    return (
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
                customRenderer={(props) => (
                    <CanvasToImageRenderer
                        {...props}
                        imageScale={imageScale}
                        setImageScale={setImageScale}
                    />
                )}
                renderMode="custom"
                scale={1}
                onRenderSuccess={onPageLoadSuccess}
                pageNumber={currentPdfPage}
                className="pointer-events-none select-none"
            />
        </Document>
    );
}

export const CanvasToImageRenderer = ({
    imageScale,
    setImageScale,
}: CanvasToImageRendererProps) => {
    const pageContext = usePageContext();
    if (!pageContext) {
        return <span>Unable to find Page context.</span>;
    }

    const { _className, page, rotate, scale } = pageContext;

    if (!page) {
        return (
            <span>
                Attempted to render page canvas, but no page was specified.
            </span>
        );
    }

    const imageElement = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const viewport = useMemo(
        () => page.getViewport({ scale, rotation: rotate }),
        [page, rotate, scale]
    );

    const updateImageScale = () => {
        if (!imageElement.current) return;
        const currentWidth = imageElement.current.clientWidth;
        const originalWidth = viewport.width;
        const newScale = currentWidth / originalWidth;

        // Sometimes the image width is 0, so we don't want to update the scale
        if (currentWidth <= 0 || originalWidth <= 0) {
            logger.debug("Image width is 0, not updating scale");
            return;
        }

        if (newScale !== imageScale) {
            setImageScale(newScale);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            updateImageScale();
        });

        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
        };
    }, [viewport?.width]);

    function drawPageOnImage() {
        if (!page) return;
        const { current: image } = imageElement;
        if (!image) return;

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext: RenderParameters = {
            canvasContext: canvas.getContext("2d", {
                alpha: false,
            }) as CanvasRenderingContext2D,
            viewport,
        };

        const cancellable = page.render(renderContext);
        cancellable.promise
            .then(() => {
                image.src = canvas.toDataURL();
                updateImageScale(); // Ensure scale updates after image renders
            })
            .catch(() => {
                // Handle errors if necessary
            });

        return () => {
            cancellable.cancel();
        };
    }

    useEffect(drawPageOnImage, [imageElement,page, viewport]);

    return (
        <div ref={containerRef} className="relative w-full h-auto">
            <img
                className={`${_className}__image w-full h-auto`}
                // height={viewport.height}
                // width={viewport.width}
                ref={imageElement}
            />
            {!IS_PRODUCTION_ENV && (
                <div className="absolute top-2 left-2 bg-gray-900 text-white text-sm px-2 py-1 rounded">
                    Scale: {imageScale.toFixed(2)}
                </div>
            )}
        </div>
    );
};
