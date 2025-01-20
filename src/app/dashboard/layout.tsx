"use client";
import { useState } from "react";
import {
    DoubleRightOutlined,
    DoubleLeftOutlined,
    HomeOutlined,
    SignatureOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Layout,
    Menu,
    theme,
    Typography,
    Space,
    MenuProps,
    Flex,
    Avatar,
    Spin,
} from "antd";
import Image from "next/image";
import { APP_NAME } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const BarSize = 56;

export default function DashboardLayout() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, colorBgLayout, borderRadiusLG },
    } = theme.useToken();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/");
        return null;
    }

    console.log(user);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <LeftSideBar collapsed={collapsed} />

            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgLayout,
                        height: BarSize,
                    }}
                >
                    <Flex
                        justify="space-between"
                        align="center"
                        style={{ height: "100%" }}
                    >
                        <Button
                            size="small"
                            type="text"
                            icon={
                                collapsed ? (
                                    <DoubleRightOutlined />
                                ) : (
                                    <DoubleLeftOutlined />
                                )
                            }
                            onClick={() => setCollapsed(!collapsed)}
                        />
                        <Space
                            style={{
                                marginRight: 24,
                            }}
                        >
                            <Space>
                                {/* TODO: change */}
                                <Text>{user.lastName}</Text>
                                <Avatar
                                    src={user.profileUrl}
                                    icon={<UserOutlined />}
                                />
                            </Space>
                        </Space>
                    </Flex>
                </Header>

                <Content
                    className="mr-4 mb-4"
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                ></Content>
            </Layout>
        </Layout>
    );
}

function LeftSideBar({ collapsed }: { collapsed: boolean }) {
    const menuItems = [
        {
            key: "1",
            icon: <HomeOutlined />,
            label: "Projects",
        },
        {
            key: "2",
            icon: <SignatureOutlined />,
            label: "Signature request",
        },
    ] satisfies Array<Required<MenuProps>["items"][number]>;

    const {
        token: { colorBgLayout },
    } = theme.useToken();

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            collapsedWidth={BarSize}
            style={{ background: colorBgLayout }}
        >
            <Logo collapsed={collapsed} />
            <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                items={menuItems}
                style={{
                    background: colorBgLayout,
                    borderRight: "none",
                }}
            />
        </Sider>
    );
}

function Logo({ collapsed }: { collapsed: boolean }) {
    return (
        <Flex
            justify="center"
            align="center"
            style={{ height: BarSize }}
            gap={4}
        >
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            <Title
                level={4}
                style={{ margin: 0, display: collapsed ? "none" : "block" }}
            >
                {APP_NAME}
            </Title>
        </Flex>
    );
}
