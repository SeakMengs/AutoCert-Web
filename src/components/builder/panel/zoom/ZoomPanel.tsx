import { createScopedLogger } from "@/utils/logger";
import { Space, Button, Typography } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { ZoomProps } from "../../zoom/Zoom";

const { Text } = Typography;

const logger = createScopedLogger("components:builder:panel:ZoomPanel");

export interface ZoomPanelProps extends Pick<ZoomProps, "transformWrapperRef"> {
  zoomScale: number;
}

export default function ZoomPanel({
  transformWrapperRef,
  zoomScale,
}: ZoomPanelProps) {
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

  // Apply absolute when call this component by itself.
  // <div className="absolute bottom-4 right-4">
  // </div>

  return (
    <Space direction="horizontal" wrap>
      <Button
        icon={<ZoomInOutlined />}
        onClick={handleZoomIn}
        size="middle"
        aria-label="Zoom in"
      />
      <Text style={{ minWidth: 48, textAlign: "center" }}>
        {`${Math.round(zoomScale * 100)}%`}
      </Text>
      <Button
        icon={<ZoomOutOutlined />}
        onClick={handleZoomOut}
        size="middle"
        aria-label="Zoom out"
      />
      <Button
        icon={<UndoOutlined />}
        onClick={handleReset}
        size="middle"
        aria-label="Reset zoom"
      >
        <span className="hidden sm:inline">Reset</span>
      </Button>
    </Space>
  );
}
