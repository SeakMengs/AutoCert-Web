import { Flex, Space, Switch, Tooltip, Typography } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useAutoCertStore } from "@/components/builder/providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { hasPermission, ProjectPermission } from "@/auth/rbac";
import { ProjectStatus } from "@/types/project";

export interface SettingsToolProps {
  qrCodeEnabled: boolean;
  onQrCodeEnabledChange: (enabled: boolean) => void;
}

const { Text } = Typography;

export default function SettingsTool({
  qrCodeEnabled,
  onQrCodeEnabledChange,
}: SettingsToolProps) {
  const { project, roles } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        roles: state.roles,
      };
    }),
  );

  const canEdit =
    project.status === ProjectStatus.Draft &&
    hasPermission(roles, [ProjectPermission.SettingsUpdate]);

  return (
    <Space direction="vertical" className="w-full">
      <Flex justify="space-between" align="center">
        <Text>
          Embed qr code
          <Tooltip title="Embeds QR code in bottom-right corner of all PDF certificate pages after generation.">
            <QuestionCircleOutlined className="ml-1" />
          </Tooltip>
        </Text>
        <Switch
          disabled={!canEdit}
          checked={qrCodeEnabled}
          onChange={onQrCodeEnabledChange}
        />
      </Flex>
    </Space>
  );
}
