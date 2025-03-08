import React, { PropsWithChildren, RefObject } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchContentRef,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("components:builder:zoom:AutoCertZoom");
export interface AutoCertZoomProps {
  transformWrapperRef: RefObject<ReactZoomPanPinchContentRef | null>;
  onZoomScaleChange: (zoomScale: number) => void;
}

export default function AutoCertZoom({
  transformWrapperRef,
  children,
  onZoomScaleChange,
}: PropsWithChildren<AutoCertZoomProps>) {
  const onTransformed = (
    ref: ReactZoomPanPinchRef,
    state: {
      scale: number;
      positionX: number;
      positionY: number;
    },
  ): void => {
    logger.debug("onTransformed", state);

    onZoomScaleChange(state.scale);
  };

  return (
    // <div className="relative w-full h-full">
    <TransformWrapper
      ref={transformWrapperRef}
      initialScale={1}
      centerOnInit
      centerZoomedOut
      minScale={0.3}
      maxScale={3}
      onTransformed={onTransformed}
      wheel={{
        wheelDisabled: true,
        // disabled: true,
      }}
      pinch={
        {
          // disabled: true,
        }
      }
      panning={
        {
          // disabled: true,
        }
      }
      zoomAnimation={{
        animationTime: 200,
      }}
      // disabled
    >
      <TransformComponent
        wrapperStyle={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
          overflow: "inherit",
        }}
        contentStyle={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </TransformComponent>
    </TransformWrapper>
    // </div>
  );
}
