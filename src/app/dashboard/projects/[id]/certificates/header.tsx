"use client";
import { headerStyle, BarSize } from "@/app/dashboard/layout_client";
import {
  Button,
  Flex,
  Modal,
  Space,
  Switch,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { downloadAllCertificates, toggleProjectVisibility } from "./temp";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { SignatoryList } from "./signatory_list";
import { ActivityLogDialog } from "./activity_log_dialog";

const { Title, Text } = Typography;
export default function Header() {
  const {
    token: { colorSplit, colorBgContainer },
  } = theme.useToken();

  const [isPublic, setIsPublic] = useState(true);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [isSignatoryOpen, setIsSignatoryOpen] = useState(false);

  const handleVisibilityToggle = async (checked: boolean) => {
    setIsPublic(checked);
    await toggleProjectVisibility(checked);
  };

  return (
    <header
      style={{
        ...headerStyle,
        padding: 0,
        background: colorBgContainer,
        height: BarSize,
        borderBottom: `1px solid ${colorSplit}`,
      }}
    >
      <Flex
        className="w-full h-full p-2"
        align="center"
        justify="space-between"
      >
        <Title
          level={4}
          className="m-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
        >
          Certificate of Achievement
        </Title>
        <Flex wrap={"nowrap"} align="center" gap={8}>
          <Space wrap={false} align="center">
            <Switch checked={isPublic} onChange={handleVisibilityToggle} />
            <Text className="whitespace-nowrap text-ellipsis">
              {isPublic ? <EyeOutlined /> : <EyeInvisibleOutlined />}{" "}
              {isPublic ? "Public" : "Private"}
            </Text>
          </Space>
          <Tooltip title="Activity Log">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setIsActivityLogOpen(true)}
            />
          </Tooltip>
          <Tooltip title="Download All">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadAllCertificates()}
            />
          </Tooltip>
          <Tooltip title="View Signatories">
            <Button
              icon={<TeamOutlined />}
              onClick={() => {
                setIsSignatoryOpen(true);
              }}
            />
          </Tooltip>
        </Flex>
      </Flex>
      <ActivityLogDialog
        open={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
      />
      <Modal
        title="Signatories"
        open={isSignatoryOpen}
        onCancel={() => setIsSignatoryOpen(false)}
        footer={null}
      >
        <SignatoryList />
      </Modal>
    </header>
  );
}
