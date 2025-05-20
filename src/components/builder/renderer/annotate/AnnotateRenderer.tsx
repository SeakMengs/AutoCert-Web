import { BaseAnnotateProps } from "@/components/builder/annotate/BaseAnnotate";
import SignatureAnnotate from "@/components/builder/annotate/SignatureAnnotate";
import ColumnAnnotate from "@/components/builder/annotate/ColumnAnnotate";
import { JSX, MouseEvent, memo } from "react";
import { useAutoCertStore } from "../../providers/AutoCertStoreProvider";
import { AnnotateState, AnnotateType } from "../../store/autocertAnnotate";

export interface AnnotateRendererProps
  extends Pick<
    BaseAnnotateProps,
    "previewMode" | "pageNumber" | "pageOriginalSize" | "containerRef"
  > {
  annotatesByPage: AnnotateState[];
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
  ...restProps
}: AnnotateRendererProps) {
  const {
    selectedAnnotateId,
    zoom,
    onAnnotateSelect,
    onDragStop,
    onResizeStop,
    roles,
  } = useAutoCertStore((state) => ({
    selectedAnnotateId: state.selectedAnnotateId,
    onAnnotateSelect: state.setSelectedAnnotateId,
    zoom: state.zoom,
    onDragStop: state.onAnnotateDragStop,
    onResizeStop: state.onAnnotateResizeStop,
    roles: state.roles,
  }));

  const onAnnotationSelect = (id: string | undefined): void => {
    if (restProps.previewMode) {
      return;
    }

    onAnnotateSelect(id);
  };

  const Annotates = (): (JSX.Element | null)[] | null => {
    if (!Array.isArray(annotatesByPage) || annotatesByPage.length === 0) {
      return null;
    }

    return annotatesByPage.map((annotate) => {
      const selected = selectedAnnotateId === annotate.id;
      switch (annotate.type) {
        case AnnotateType.Column:
          return (
            <ColumnAnnotate
              {...annotate}
              {...restProps}
              key={annotate.id}
              selected={selected}
              onAnnotateSelect={onAnnotationSelect}
              zoomScale={zoom}
              onDragStop={onDragStop}
              onResizeStop={onResizeStop}
              roles={roles}
            />
          );
        case AnnotateType.Signature:
          return (
            <SignatureAnnotate
              {...annotate}
              {...restProps}
              key={annotate.id}
              selected={selected}
              onAnnotateSelect={onAnnotationSelect}
              zoomScale={zoom}
              onDragStop={onDragStop}
              onResizeStop={onResizeStop}
              roles={roles}
            />
          );
        default:
          return null;
      }
    });
  };

  const handleContainerClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isAnnotationClick = target.closest(".autocert-drag");
    if (!isAnnotationClick) {
      onAnnotationSelect(undefined);
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="absolute top-0 left-0 w-full h-full z-10"
    >
      {Annotates()}
    </div>
  );
}

export default memo(AnnotateRenderer);
