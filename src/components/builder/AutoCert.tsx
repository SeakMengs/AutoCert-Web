import { WHSize, XYPosition } from "./annotate/BaseAnnotate";
import AnnotateRenderer, {
    AnnotateRendererProps,
} from "./renderer/AnnotateRenderer";
import PdfRenderer, { PdfRendererProps } from "./renderer/PdfRenderer";

// When "AutoCert" is mentioned in a type, it usually state value type
type BaseAutoCertAnnotate = {
    id: string;
    type: "text" | "signature";
} & XYPosition & // The position of the annotation in x and y axis
    WHSize; // The rectangle size of the annotation;

export type AutoCertTextAnnotate = BaseAutoCertAnnotate & {
    type: "text";
    value: string;
};

export type AutoCertSignatureAnnotate = BaseAutoCertAnnotate & {
    type: "signature";
    // Can be a base64 string or a data URL
    signatureData: string;
};

export type AutoCertAnnotate = AutoCertTextAnnotate | AutoCertSignatureAnnotate;

// Each page has a list of annotates
export type AutoCertAnnotates = Record<number, AutoCertAnnotate[]>;

export type AutoCertProps = AnnotateRendererProps & PdfRendererProps;

export default function AutoCert({
    annotates,
    currentPage,
    pdfFile,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    onDragStop,
    onResizeStop,
}: AutoCertProps) {
    return (
        <div className="relative border border-gray-300">
            <PdfRenderer
                currentPage={currentPage}
                pdfFile={pdfFile}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onPageLoadSuccess={onPageLoadSuccess}
            />
            <AnnotateRenderer
                annotates={annotates}
                currentPage={currentPage}
                onDragStop={onDragStop}
                onResizeStop={onResizeStop}
            />
        </div>
    );
}