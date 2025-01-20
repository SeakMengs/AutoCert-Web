"use client";
import { ReactNode, useState } from "react";
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
} from "antd";
import Image from "next/image";
import { APP_NAME } from "@/utils";
import { AuthUser } from "@/types/models";
import { useRouter, useSearchParams } from "next/navigation";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const BarSize = 56;

export default function DashboardLayoutClient({
    user,
    children,
}: {
    user: AuthUser;
    children: Readonly<ReactNode>;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, colorBgLayout, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: "100vh" }} hasSider>
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
                    className="mr-4 mb-4 p-4 drop-shadow-sm"
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}

function LeftSideBar({ collapsed }: { collapsed: boolean }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const menuItems = [
        {
            key: "1",
            icon: <HomeOutlined />,
            label: "Projects",
            route: "/dashboard/projects",
        },
        {
            key: "2",
            icon: <SignatureOutlined />,
            label: "Signature request",
            route: "/dashboard/signature-request",
        },
    ] satisfies Array<Required<MenuProps>["items"][number] & { route: string }>;

    const {
        token: { colorBgLayout },
    } = theme.useToken();

    const onMenuClick = ({ key }: { key: string }) => {
        const item = menuItems.find((item) => item.key === key);
        if (item) {
            router.push(`${item.route}?${searchParams.toString()}`);
        }
    };

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
                onClick={onMenuClick}
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
