"use client";
import { Result, Button, Typography, Space, Flex, theme } from "antd";
import {
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

const { Text, Title } = Typography;
const { useToken } = theme;

export interface AccountRestrictedProps {
  title?: string | ReactNode;
  subTitle?: string | ReactNode;
  extra?: ReactNode;
}

export default function AccountRestricted({
  title,
  subTitle,
  extra,
}: AccountRestrictedProps) {
  const { token } = useToken();

  const fallbackTitle: ReactNode = (
    <Title
      level={3}
      style={{
        color: token.colorError,
        fontWeight: 600,
        marginBottom: token.marginMD,
        textShadow: `0 1px 2px ${token.colorBgElevated}`,
      }}
    >
      Account Restricted
    </Title>
  );

  const fallbackSubTitle: ReactNode = (
    <Text
      style={{
        color: token.colorTextSecondary,
        fontSize: token.fontSizeLG,
        opacity: 0.85,
        maxWidth: 480,
        textAlign: "center",
        display: "inline-block",
      }}
    >
      Your account is restricted from accessing this feature. Only email addresses ending with{" "}
      <b>{process.env.FULL_ACCESS_EMAIL_DOMAIN}</b> have full access. <br />
      Please use a different account that ends with <b>{process.env.FULL_ACCESS_EMAIL_DOMAIN}</b>.
    </Text>
  );

  return (
    <Flex className="h-screen" align="center" justify="center">
      <Result
        status="403"
        icon={<LockOutlined style={{ color: token.colorError }} />}
        title={typeof title === "string" ? (
          <Title
            level={3}
            style={{
              color: token.colorError,
              fontWeight: 600,
              marginBottom: token.marginMD,
              textShadow: `0 1px 2px ${token.colorBgElevated}`,
            }}
          >
            {title}
          </Title>
        ) : title || fallbackTitle}
        subTitle={typeof subTitle === "string" ? (
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeLG,
              opacity: 0.85,
              maxWidth: 480,
              textAlign: "center",
              display: "inline-block",
            }}
          >
            {subTitle}
          </Text>
        ) : subTitle || fallbackSubTitle}
        extra={
          extra || (
            <Space>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() =>
                  typeof window !== "undefined" && window.history.back()
                }
                style={{
                  background: token.colorPrimary,
                  borderColor: token.colorPrimary,
                }}
              >
                Go Back
              </Button>
            </Space>
          )
        }
      />
    </Flex>
  );
}
