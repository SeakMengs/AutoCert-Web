import { BaseAnnotateProps } from "../../annotate/BaseAnnotate";
import SignatureAnnotate from "../../annotate/SignatureAnnotate";
import ColumnAnnotate from "../../annotate/ColumnAnnotate";
import { AnnotateState } from "../../hooks/useAutoCert";
import { MouseEvent, memo, useCallback, useMemo } from "react";

export interface AnnotateRendererProps
  extends Pick<
    BaseAnnotateProps,
    | "onDragStop"
    | "onResizeStop"
    | "previewMode"
    | "onAnnotateSelect"
    | "zoomScale"
    | "pageNumber"
    | "pageOriginalSize"
    | "containerRef"
  > {
  selectedAnnotateId: string | undefined;
  annotatesByPage: AnnotateState[];
  currentPdfPage: number;
}

// const COLUMN_RESIZABLE = {
//   bottom: false,
//   bottomLeft: false,
//   bottomRight: false,
//   left: true,
//   right: true,
//   top: false,
//   topLeft: false,
//   topRight: false,
// };

function AnnotateRenderer({
  annotatesByPage,
  currentPdfPage,
  selectedAnnotateId,
  ...restProps
}: AnnotateRendererProps) {
  const onAnnotationSelect = useCallback(
    (id: string | undefined): void => {
      if (restProps.previewMode) {
        return;
      }

      restProps.onAnnotateSelect(id);
    },
    [restProps.previewMode, restProps.onAnnotateSelect],
  );

  const Annotates = useMemo(() => {
    if (!Array.isArray(annotatesByPage) || annotatesByPage.length === 0) {
      return null;
    }

    return annotatesByPage.map((annotate) => {
      const selected = selectedAnnotateId === annotate.id;
      switch (annotate.type) {
        case "column":
          return (
            <ColumnAnnotate
              {...annotate}
              {...restProps}
              key={annotate.id}
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
              selected={selected}
              onAnnotateSelect={onAnnotationSelect}
            />
          );
        default:
          return null;
      }
    });
  }, [annotatesByPage, selectedAnnotateId, restProps, onAnnotationSelect]);

  const handleContainerClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isAnnotationClick = target.closest(".autocert-drag");
      if (!isAnnotationClick) {
        onAnnotationSelect(undefined);
      }
    },
    [onAnnotationSelect],
  );

  return (
    <div
      onClick={handleContainerClick}
      className="absolute top-0 left-0 w-full h-full z-10"
    >
      {Annotates}
    </div>
  );
}

export default memo(AnnotateRenderer);
