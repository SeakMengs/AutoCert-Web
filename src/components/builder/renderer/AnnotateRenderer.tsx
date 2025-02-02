import { BaseAnnotateProps } from "../annotate/BaseAnnotate";
import SignatureAnnotate from "../annotate/SignatureAnnotate";
import TextAnnotate from "../annotate/TextAnnotate";
import { AutoCertAnnotates } from "../AutoCert";

export type AnnotateRendererProps = {
    annotates: AutoCertAnnotates;
    currentPage: number;
} & Pick<BaseAnnotateProps, "onDragStop" | "onResizeStop">;

const AnnotateColor = "#FFC4C4";

export default function AnnotateRenderer({
    annotates,
    currentPage,
    onDragStop,
    onResizeStop,
}: AnnotateRendererProps) {
    const Annotates =
        Array.isArray(annotates[currentPage]) &&
        annotates[currentPage].map((annotate) => {
            switch (annotate.type) {
                case "text":
                    return (
                        <TextAnnotate
                            {...annotate}
                            key={annotate.id}
                            bgColor={AnnotateColor}
                            onDragStop={onDragStop}
                            onResizeStop={onResizeStop}
                        />
                    );
                case "signature":
                    return (
                        <SignatureAnnotate
                            {...annotate}
                            key={annotate.id}
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
        <div className="absolute top-0 left-0 w-full h-full">{Annotates}</div>
    );
}