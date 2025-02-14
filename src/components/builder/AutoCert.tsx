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
    selectedAnnotateId,
    setScale,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    onDragStop,
    onResizeStop,
    onAnnotateSelect,
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
                    selectedAnnotateId={selectedAnnotateId}
                    currentPdfPage={currentPdfPage}
                    onDragStop={onDragStop}
                    onResizeStop={onResizeStop}
                    onAnnotateSelect={onAnnotateSelect}
                />
            </div>
        </div>
    );
}
