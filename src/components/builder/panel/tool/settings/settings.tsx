import { Flex, Space, Switch, Tooltip, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

export interface SettingsToolProps {
  qrCodeEnabled: boolean;
  onQrCodeEnabledChange: (enabled: boolean) => void;
}

const { Text } = Typography;

export default function SettingsTool({
  qrCodeEnabled,
  onQrCodeEnabledChange,
}: SettingsToolProps) {
  return (
    <Space direction="vertical" className="w-full">
      <Flex justify="space-between" align="center">
        <Text>
          Embed qr code
          <Tooltip title="Embeds QR code in bottom-right corner of all PDF certificate pages after generation.">
            <QuestionCircleOutlined className="ml-1" />
          </Tooltip>
        </Text>
        <Switch checked={qrCodeEnabled} onChange={onQrCodeEnabledChange} />
      </Flex>
    </Space>
  );
}
