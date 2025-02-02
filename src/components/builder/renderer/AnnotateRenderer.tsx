import { BaseAnnotateProps } from "../annotate/BaseAnnotate";
import SignatureAnnotate from "../annotate/SignatureAnnotate";
import TextAnnotate from "../annotate/TextAnnotate";
import { AutoCertAnnotations } from "../AutoCert";

export type AnnotateRendererProps = {
    annotations: AutoCertAnnotations;
    currentPage: number;
} & Pick<BaseAnnotateProps, "onDragStop" | "onResizeStop">;

const AnnotateColor = "#FFC4C4";

export default function AnnotateRenderer({
    annotations,
    currentPage,
    onDragStop,
    onResizeStop,
}: AnnotateRendererProps) {
    const Annotations =
        Array.isArray(annotations[currentPage]) &&
        annotations[currentPage].map((annotation) => {
            switch (annotation.type) {
                case "text":
                    return (
                        <TextAnnotate
                            {...annotation}
                            key={annotation.id}
                            bgColor={AnnotateColor}
                            onDragStop={onDragStop}
                            onResizeStop={onResizeStop}
                        />
                    );
                case "signature":
                    return (
                        <SignatureAnnotate
                            {...annotation}
                            key={annotation.id}
                            bgColor={AnnotateColor}
                            onDragStop={onDragStop}
                            onResizeStop={onResizeStop}
                        />
                    );
                default:
                    return null;
            }
        });

    return (
        <div className="absolute top-0 left-0 w-full h-full">{Annotations}</div>
    );
}