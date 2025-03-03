import React, { PropsWithChildren, RefObject, useRef, useState } from "react";
import {
    TransformWrapper,
    TransformComponent,
    ReactZoomPanPinchContentRef,
    ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { Button, Space, Typography } from "antd";
import {
    ZoomInOutlined,
    ZoomOutOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("components:builder:zoom:AutoCertZoom");
const { Text } = Typography;

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

        transformWrapperRef.current.zoomIn(0.1, 0);
    };

    const handleZoomOut = () => {
        if (!transformWrapperRef.current) {
            logger.error("TransformWrapper ref is null");
            return;
        }

        transformWrapperRef.current.zoomOut(0.1, 0);
    };

    const handleReset = () => {
        if (!transformWrapperRef.current) {
            logger.error("TransformWrapper ref is null");
            return;
        }

        transformWrapperRef.current.resetTransform(0);
    };

    const onTransformed = (
        ref: ReactZoomPanPinchRef,
        state: {
            scale: number;
            positionX: number;
            positionY: number;
        }
    ): void => {
        onZoomScaleChange(state.scale);
    };

    return (
        <div className="relative w-full h-full">
            <TransformWrapper
                ref={transformWrapperRef}
                panning={
                    {
                        // disabled: true,
                    }
                }
                initialScale={1}
                centerOnInit
                centerZoomedOut
                minScale={0.3}
                maxScale={3}
                onTransformed={onTransformed}
                wheel={{
                    wheelDisabled: true,
                }}
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
                        overflow: "auto",
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
            <div className="absolute bottom-4 right-4">
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
            </div>
        </div>
    );
}
