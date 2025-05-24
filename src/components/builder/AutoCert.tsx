"use client";
import { useShallow } from "zustand/react/shallow";
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

export default function AutoCert({}: AutoCertProps) {
  const { transformWrapperRef, onZoomChange } = useAutoCertStore(
    useShallow((state) => ({
      transformWrapperRef: state.transformWrapperRef,
      onZoomChange: state.onZoomChange,
    })),
  );

  return (
    <Zoom
      transformWrapperRef={transformWrapperRef}
      onZoomScaleChange={onZoomChange}
    >
      <div className="flex">
        <div className="my-8 relative w-full h-full">
          <PdfRenderer />
        </div>
      </div>
    </Zoom>
  );
}
