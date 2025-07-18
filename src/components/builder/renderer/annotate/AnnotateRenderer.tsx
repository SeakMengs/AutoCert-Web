import { BaseAnnotateProps } from "@/components/builder/annotate/BaseAnnotate";
import SignatureAnnotate from "@/components/builder/annotate/SignatureAnnotate";
import ColumnAnnotate from "@/components/builder/annotate/ColumnAnnotate";
import { JSX, MouseEvent, memo } from "react";
import { useAutoCertStore } from "../../providers/AutoCertStoreProvider";
import { AnnotateState, AnnotateType } from "../../store/autocertAnnotate";
import { useShallow } from "zustand/react/shallow";

export interface AnnotateRendererProps
  extends Pick<
    BaseAnnotateProps,
    "pageNumber" | "pageOriginalSize" | "containerRef"
  > {
  annotatesByPage: AnnotateState[];
}

function AnnotateRenderer({
  annotatesByPage,
  containerRef,
  pageNumber,
  pageOriginalSize,
}: AnnotateRendererProps) {
  const {
    selectedAnnotateId,
    zoom,
    roles,
    isSignatoryToAnnotate,
    onAnnotateSelect,
    onDragStart,
    onDragStop,
    onResizeStart,
    onResizeStop,
    getAnnotateLockState,
  } = useAutoCertStore(
    useShallow((state) => ({
      selectedAnnotateId: state.selectedAnnotateId,
      zoom: state.zoom,
      roles: state.roles,
      isSignatoryToAnnotate: state.isSignatoryToAnnotate,
      onDragStart: state.onAnnotateDragStart,
      onDragStop: state.onAnnotateDragStop,
      onResizeStart: state.onAnnotateResizeStart,
      onResizeStop: state.onAnnotateResizeStop,
      onAnnotateSelect: state.setSelectedAnnotateId,
      getAnnotateLockState: state.getAnnotateLockState,
    })),
  );

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
              pageNumber={pageNumber}
              pageOriginalSize={pageOriginalSize}
              containerRef={containerRef}
              key={annotate.id}
              selected={selected}
              onAnnotateSelect={onAnnotateSelect}
              zoomScale={zoom}
              onDragStart={onDragStart}
              onDragStop={onDragStop}
              onResizeStart={onResizeStart}
              onResizeStop={onResizeStop}
              roles={roles}
              lock={getAnnotateLockState(annotate)}
            />
          );
        case AnnotateType.Signature:
          return (
            <SignatureAnnotate
              {...annotate}
              key={annotate.id}
              isCurrentSignatory={isSignatoryToAnnotate(annotate)}
              pageNumber={pageNumber}
              pageOriginalSize={pageOriginalSize}
              containerRef={containerRef}
              selected={selected}
              onAnnotateSelect={onAnnotateSelect}
              zoomScale={zoom}
              onDragStart={onDragStart}
              onDragStop={onDragStop}
              onResizeStart={onResizeStart}
              onResizeStop={onResizeStop}
              roles={roles}
              lock={getAnnotateLockState(annotate)}
            />
          );
        default:
          return null;
      }
    });
  };

  const handleContainerClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isAnnotClicked = target.closest(".autocert-drag");
    if (!isAnnotClicked) {
      onAnnotateSelect(undefined);
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
