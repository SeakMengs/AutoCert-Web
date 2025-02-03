import { ResizeEnable } from "react-rnd";
import { BaseAnnotateProps } from "../annotate/BaseAnnotate";
import SignatureAnnotate from "../annotate/SignatureAnnotate";
import TextAnnotate from "../annotate/TextAnnotate";
import { AnnotateStates } from "../hooks/useAutoCert";

export interface AnnotateRendererProps
    extends Pick<BaseAnnotateProps, "onDragStop" | "onResizeStop" | "previewMode"> {
    annotates: AnnotateStates;
    currentPdfPage: number;
}

const TEXT_RESIZABLE = {
    bottom: false,
    bottomLeft: false,
    bottomRight: false,
    left: true,
    right: true,
    top: false,
    topLeft: false,
    topRight: false,
} satisfies ResizeEnable;

export default function AnnotateRenderer({
    annotates,
    currentPdfPage,
    previewMode,
    onDragStop,
    onResizeStop,
}: AnnotateRendererProps) {
    const Annotates =
        Array.isArray(annotates[currentPdfPage]) &&
        annotates[currentPdfPage].map((annotate) => {
            switch (annotate.type) {
                case "text":
                    return (
                        <TextAnnotate
                            {...annotate}
                            key={annotate.id}
                            previewMode={previewMode}
                            resizable={TEXT_RESIZABLE}
                            onDragStop={onDragStop}
                            onResizeStop={onResizeStop}
                        />
                    );
                case "signature":
                    return (
                        <SignatureAnnotate
                            {...annotate}
                            key={annotate.id}
                            previewMode={previewMode}
                            resizable={undefined}
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
