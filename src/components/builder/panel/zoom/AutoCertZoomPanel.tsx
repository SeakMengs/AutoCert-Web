import { createScopedLogger } from "@/utils/logger";
import { Space, Button, Typography } from "antd";
import { AutoCertZoomProps } from "../../zoom/AutoCertZoom";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const logger = createScopedLogger("components:builder:panel:AutoCertZoomPanel");

export interface AutoCertZoomPanelProps
  extends Pick<AutoCertZoomProps, "transformWrapperRef"> {
  zoomScale: number;
}

export default function AutoCertZoomPanel({
  transformWrapperRef,
  zoomScale,
}: AutoCertZoomPanelProps) {
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
    <Space>
      <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
      <Text>{`${Math.round(zoomScale * 100)}%`}</Text>
      <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
      <Button icon={<UndoOutlined />} onClick={handleReset}>
        Reset
      </Button>
    </Space>
  );
}
