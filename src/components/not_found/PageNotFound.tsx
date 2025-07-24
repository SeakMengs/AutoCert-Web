"use client";
import { Result, Button, Typography, Space, Flex, theme } from "antd";
import { FrownOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { useToken } = theme;

export default function PageNotFound() {
    const { token } = useToken();

    return (
        <Flex className="h-screen" align="center" justify="center">
            <Result
                status="404"
                icon={<FrownOutlined style={{ color: token.colorPrimary }} />}
                title={
                    <Title
                        level={3}
                        style={{
                            color: token.colorPrimary,
                            fontWeight: 600,
                            marginBottom: token.marginMD,
                            textShadow: `0 1px 2px ${token.colorBgElevated}`,
                        }}
                    >
                        Page Not Found
                    </Title>
                }
                subTitle={
                    <Text
                        style={{
                            color: token.colorTextSecondary,
                            fontSize: token.fontSizeLG,
                            opacity: 0.85,
                        }}
                    >
                        Sorry, the page you&apos;re looking for doesn&apos;t exist.
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
                                background: token.colorPrimary,
                                borderColor: token.colorPrimary,
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
