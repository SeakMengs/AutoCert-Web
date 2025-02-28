import AutoCertPanel from "./panel/AutoCertPanel";
import AutoCertTable from "./panel/AutoCertTable";
("./panel/AutoCertPanel");
import AnnotateRenderer, {
    AnnotateRendererProps,
} from "./renderer/AnnotateRenderer";
import PdfRenderer, { PdfRendererProps } from "./renderer/PdfRenderer";

export interface AutoCertProps
    extends AnnotateRendererProps,
        PdfRendererProps {}

export { AutoCertTable, AutoCertPanel };

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
                    scale={scale}
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
