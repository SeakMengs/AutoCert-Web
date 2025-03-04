import { ResizeEnable } from "react-rnd";
import { BaseAnnotateProps } from "../../annotate/BaseAnnotate";
import SignatureAnnotate from "../../annotate/SignatureAnnotate";
import TextAnnotate from "../../annotate/TextAnnotate";
import { AnnotateState } from "../../hooks/useAutoCert";
import { MouseEvent } from "react";

export interface AnnotateRendererProps
  extends Pick<
    BaseAnnotateProps,
    | "onDragStop"
    | "onResizeStop"
    | "previewMode"
    | "onAnnotateSelect"
    | "scale"
    | "zoomScale"
    | "pageNumber"
  > {
  selectedAnnotateId: string | undefined;
  annotatesByPage: AnnotateState[];
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
  annotatesByPage,
  currentPdfPage,
  selectedAnnotateId,
  ...restProps
}: AnnotateRendererProps) {
  const onAnnotationSelect = (id: string | undefined): void => {
    if (restProps.previewMode) {
      return;
    }

    restProps.onAnnotateSelect(id);
  };

  const Annotates =
    Array.isArray(annotatesByPage) &&
    annotatesByPage.map((annotate) => {
      const selected = selectedAnnotateId === annotate.id;
      switch (annotate.type) {
        case "text":
          return (
            <TextAnnotate
              {...annotate}
              {...restProps}
              key={annotate.id}
              resizable={TEXT_RESIZABLE}
              selected={selected}
              onAnnotateSelect={onAnnotationSelect}
            />
          );
        case "signature":
          return (
            <SignatureAnnotate
              {...annotate}
              {...restProps}
              key={annotate.id}
              resizable={undefined}
              selected={selected}
              onAnnotateSelect={onAnnotationSelect}
            />
          );
        default:
          return null;
      }
    });

  return (
    <div
      onClick={(e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isAnnotationClick = target.closest(".annotation-rnd");
        if (!isAnnotationClick) {
          onAnnotationSelect(undefined);
        }
      }}
      className="absolute top-0 left-0 w-full h-full z-10"
    >
      {Annotates}
    </div>
  );
}
