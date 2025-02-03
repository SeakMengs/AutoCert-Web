import AnnotateRenderer, {
    AnnotateRendererProps,
} from "./renderer/AnnotateRenderer";
import PdfRenderer, { PdfRendererProps } from "./renderer/PdfRenderer";

export type AutoCertProps = AnnotateRendererProps & PdfRendererProps;

export default function AutoCert({
    annotates,
    currentPdfPage,
    pdfFile,
    previewMode,
    scale,
    setScale,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    onDragStop,
    onResizeStop,
}: AutoCertProps) {
    return (
        <div className="flex">
            <div className="relative border border-gray-300">
                <PdfRenderer
                    scale={scale}
                    setScale={setScale}
                    currentPdfPage={currentPdfPage}
                    pdfFile={pdfFile}
                    onDocumentLoadSuccess={onDocumentLoadSuccess}
                    onPageLoadSuccess={onPageLoadSuccess}
                />
                <AnnotateRenderer
                    previewMode={previewMode}
                    annotates={annotates}
                    currentPdfPage={currentPdfPage}
                    onDragStop={onDragStop}
                    onResizeStop={onResizeStop}
                />
            </div>
        </div>
    );
}
