import { headerStyle, BarSize } from "@/app/dashboard/layout_client";
import { Badge, Flex, Space, Spin, Tag, theme, Typography } from "antd";
import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useAutoCertStore } from "@/components/builder/providers/AutoCertStoreProvider";
import { useShallow } from "zustand/react/shallow";
import { JSX, useEffect, useState } from "react";
import moment from "moment";
import { SECOND } from "@/utils/time";
import { ProjectStatus } from "@/types/project";

const { Title, Text } = Typography;

export interface BuilderHeaderProps {
  title: string;
}

export default function Header({ title }: BuilderHeaderProps) {
  const [lastSyncFromNow, setLastSyncFromNow] = useState<string>("Unkown");
  const {
    token: { colorSplit, colorBgContainer },
  } = theme.useToken();

  const { lastSync, changes, isPushingChanges, project } = useAutoCertStore(
    useShallow((state) => {
      return {
        project: state.project,
        lastSync: state.lastSync,
        changes: state.changes,
        isPushingChanges: state.isPushingChanges,
      };
    }),
  );

  const changeCount = changes.length;
  const isCompleted = project.status === ProjectStatus.Completed;
  const isProcessing = project.status === ProjectStatus.Processing;

  const renderStatus = (): JSX.Element => {
    if (isCompleted) {
      return (
        <Tag
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          color="success"
        >
          Certificates generated
        </Tag>
      );
    }

    if (isProcessing) {
      return (
        <Tag icon={<LoadingOutlined spin />} color="processing">
          Generating certificates...
        </Tag>
      );
    }

    if (isPushingChanges) {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          Syncing...
        </Tag>
      );
    }

    if (changeCount > 0) {
      return (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          {changeCount} pending change{changeCount > 1 ? "s" : ""}
        </Tag>
      );
    }

    return (
      <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
        All changes saved
      </Tag>
    );
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const updateFromNow = () => {
      if (lastSync) {
        setLastSyncFromNow(moment(lastSync).fromNow());
      } else {
        setLastSyncFromNow("Unkown");
      }
    };

    updateFromNow();

    if (lastSync) {
      intervalId = setInterval(updateFromNow, SECOND);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [lastSync]);

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
        className="w-full h-full p-2 px-4"
        align="center"
        justify="space-between"
      >
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>

        <Space size="middle">
          {renderStatus()}
          {!isProcessing && lastSync && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {`Last sync: ${lastSyncFromNow}`}
            </Text>
          )}
        </Space>
      </Flex>
    </header>
  );
}
