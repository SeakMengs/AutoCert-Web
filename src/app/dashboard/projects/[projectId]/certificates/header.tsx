"use client";
import { headerStyle, BarSize } from "@/app/dashboard/layout_client";
import {
  App,
  Button,
  Flex,
  Modal,
  Space,
  Spin,
  Switch,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { toggleProjectVisibility } from "./temp";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  TeamOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { SignatoryList } from "./signatory_list";
import { ActivityLogDialog } from "./activity_log_dialog";
import { createScopedLogger } from "@/utils/logger";
import usePrint from "@/hooks/usePrint";
import { z } from "zod";
import { getCertificatesByProjectIdSuccessResponseSchema } from "./schema";
import {
  downloadAllCertificates,
  getMergedCertificateObjectUrl,
} from "./utils";
import { useMutation } from "@tanstack/react-query";

const logger = createScopedLogger(
  "src:app:dashboard:projects:[projectId]:certificates:header.ts",
);

const { Title, Text } = Typography;

interface HeaderProps
  extends Pick<
    z.infer<typeof getCertificatesByProjectIdSuccessResponseSchema>["project"],
    "isPublic" | "id" | "title" | "signatories" | "logs"
  > {}

export default function Header({
  id,
  isPublic,
  title,
  logs,
  signatories,
}: HeaderProps) {
  const {
    token: { colorSplit, colorBgContainer },
  } = theme.useToken();

  const [isActivityLogOpen, setIsActivityLogOpen] = useState<boolean>(false);
  const [isSignatoryOpen, setIsSignatoryOpen] = useState<boolean>(false);

  const { onPrint, printLoading, setPrintLoading } = usePrint();
  const { message } = App.useApp();

  const handleVisibilityToggle = async (checked: boolean) => {
    await toggleProjectVisibility(checked);
  };

  const onPrintAllPdf = async () => {
    try {
      setPrintLoading(true);
      const url = await getMergedCertificateObjectUrl(id);
      logger.info("Printing certificates", url);

      await onPrint({
        printable: url,
        type: "pdf",
        onLoadingEnd() {
          message.success("Certificates are ready to print");
        },
        onError(err) {
          message.error("Error printing certificates");
          logger.error("Error printing certificates", err);
        },
      });

      URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Error printing certificates");
      logger.error("Error printing certificates", error);
    } finally {
      setPrintLoading(false);
    }
  };

  const {
    mutateAsync: onDownloadAllCertificatesMutation,
    isPending: isDownloading,
  } = useMutation({
    mutationFn: async (projectId: string) =>
      await downloadAllCertificates(projectId, message),
    onError: (error) => {
      logger.error("Failed to download all certificates", error);
      message.error("Failed to download all certificates");
    },
  });

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
          {title}
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
          <Tooltip title="View Signatories">
            <Button
              icon={<TeamOutlined />}
              onClick={() => {
                setIsSignatoryOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Download All Certificates">
            <Button
              icon={<DownloadOutlined />}
              onClick={async () => {
                await onDownloadAllCertificatesMutation(id);
              }}
              loading={isDownloading}
              disabled={isDownloading}
            />
          </Tooltip>
          <Tooltip title="Print All Certificates">
            <Button
              icon={<PrinterOutlined />}
              onClick={onPrintAllPdf}
              loading={printLoading}
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
        <SignatoryList signatories={signatories} />
      </Modal>
    </header>
  );
}
