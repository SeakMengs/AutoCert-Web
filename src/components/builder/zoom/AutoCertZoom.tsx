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
  zoomScale: number;
  onZoomScaleChange: (zoomScale: number) => void;
}

export default function AutoCertZoom({
  transformWrapperRef,
  children,
  zoomScale,
  onZoomScaleChange,
}: PropsWithChildren<AutoCertZoomProps>) {
  const handleZoomIn = () => {
    if (!transformWrapperRef.current) {
      logger.error("TransformWrapper ref is null");
      return;
    }

    transformWrapperRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!transformWrapperRef.current) {
      logger.error("TransformWrapper ref is null");
      return;
    }

    transformWrapperRef.current.zoomOut();
  };

  const handleReset = () => {
    if (!transformWrapperRef.current) {
      logger.error("TransformWrapper ref is null");
      return;
    }

    transformWrapperRef.current.resetTransform();
  };

  const onTransformed = (
    ref: ReactZoomPanPinchRef,
    state: {
      scale: number;
      positionX: number;
      positionY: number;
    },
  ): void => {
    onZoomScaleChange(state.scale);
  };

  return (
    <div className="relative w-full h-full">
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
          // FIXME: Currently disable zoom because flicker issue and laggy
          disabled: true,
        }}
        pinch={{
          disabled: true,
        }}
        panning={
          {
            // disabled: true,
          }
        }
        zoomAnimation={{
          animationTime: 200,
        }}
        disabled
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
      {/* FIXME: Currently disable zoom because flicker issue and laggy */}
      {/* <div className="absolute bottom-4 right-4">
                <Space>
                    <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                    <Text>{`${Math.round(zoomScale * 100)}%`}</Text>
                    <Button
                        icon={<ZoomOutOutlined />}
                        onClick={handleZoomOut}
                    />
                    <Button icon={<UndoOutlined />} onClick={handleReset}>
                        Reset
                    </Button>
                </Space>
            </div> */}
    </div>
  );
}
