"use client";
import { Result, Button, Typography, Space, Flex, theme } from "antd";
import {
  FrownOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { notFound } from "next/navigation";

const { Text, Title } = Typography;
const { useToken } = theme;

type ErrorType = "not-found" | "unauthorized";

interface NotFoundProps {
  errorType?: ErrorType;
  title?: string;
  subTitle?: string;
}

export default function ProjectNotFound({
  errorType = "not-found",
  title,
  subTitle,
}: NotFoundProps) {
  const { token } = useToken();

  const getErrorConfig = () => {
    switch (errorType) {
      case "unauthorized":
        return {
          status: "403",
          icon: <LockOutlined style={{ color: token.colorError }} />,
          title: title || "Access Denied",
          titleColor: token.colorError,
          subTitle:
            subTitle ||
            "Sorry, you don't have permission to access this project.",
          subTitleColor: token.colorTextSecondary,
        };
      case "not-found":
      default:
        return {
          status: "404",
          icon: <FrownOutlined style={{ color: token.colorPrimary }} />,
          title: title || "Project Not Found",
          titleColor: token.colorPrimary,
          subTitle:
            subTitle ||
            "Sorry, the project you're looking for doesn't exist or has been removed.",
          subTitleColor: token.colorTextSecondary,
        };
    }
  };

  const errorConfig = getErrorConfig();

  return (
    <Flex className="h-screen" align="center" justify="center">
      <Result
        status={errorConfig.status as any}
        icon={errorConfig.icon}
        title={
          <Title
            level={3}
            style={{
              color: errorConfig.titleColor,
              fontWeight: 600,
              marginBottom: token.marginMD,
              textShadow: `0 1px 2px ${token.colorBgElevated}`,
            }}
          >
            {errorConfig.title}
          </Title>
        }
        subTitle={
          <Text
            style={{
              color: errorConfig.subTitleColor,
              fontSize: token.fontSizeLG,
              opacity: 0.85,
            }}
          >
            {errorConfig.subTitle}
          </Text>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                typeof window !== "undefined" && window.history.back()
              }
              style={{
                background: errorConfig.titleColor,
                borderColor: errorConfig.titleColor,
              }}
            >
              Go Back
            </Button>
          </Space>
        }
      />
    </Flex>
  );
}
