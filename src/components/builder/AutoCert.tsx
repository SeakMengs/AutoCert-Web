"use client";
import Zoom from "./zoom/Zoom";
import AutoCertPanel from "./panel/AutoCertPanel";
import AutoCertTable from "./panel/table/AutoCertTable";
("./panel/AutoCertPanel");
import PdfRenderer, { PdfRendererProps } from "./renderer/pdf/PdfRenderer";
import { createScopedLogger } from "@/utils/logger";
import { useAutoCertStore } from "./providers/AutoCertStoreProvider";

const logger = createScopedLogger("components:builder:AutoCert");

export interface AutoCertProps extends PdfRendererProps {}

export { AutoCertTable, AutoCertPanel, Zoom };

export default function AutoCert({ previewMode }: AutoCertProps) {
  const { transformWrapperRef, onZoomChange } = useAutoCertStore((state) => ({
    transformWrapperRef: state.transformWrapperRef,
    onZoomChange: state.onZoomChange,
  }));

  return (
    <Zoom
      transformWrapperRef={transformWrapperRef}
      onZoomScaleChange={onZoomChange}
    >
      <div className="flex">
        <div className="my-8 relative w-full h-full">
          <PdfRenderer
            // For annotates
            previewMode={previewMode}
          />
        </div>
      </div>
    </Zoom>
  );
}
