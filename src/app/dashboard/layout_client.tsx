"use client";
import { ReactNode, useState } from "react";
import {
    DoubleRightOutlined,
    DoubleLeftOutlined,
    HomeOutlined,
    SignatureOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
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
    Dropdown,
} from "antd";
import Image from "next/image";
import { APP_NAME } from "@/utils";
import { AuthUser } from "@/types/models";
import { useRouter, useSearchParams } from "next/navigation";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("dashboard:layout_client");
const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const BarSize = 56;

const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    width: "100%",
    alignItems: "center",
};

export default function DashboardLayoutClient({
    user,
    children,
}: {
    user: AuthUser;
    children: Readonly<ReactNode>;
}) {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const {
        token: { colorBgContainer, colorSplit },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: "100vh" }} hasSider>
            <LeftSideBar collapsed={collapsed} />

            <Layout>
                <Header
                    style={{
                        ...headerStyle,
                        padding: 0,
                        background: colorBgContainer,
                        height: BarSize,
                        borderBottom: `1px solid ${colorSplit}`,
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
                            <UserNameAndAvatar user={user} />
                        </Space>
                    </Flex>
                </Header>
                <Content
                    className="p-4 drop-shadow-sm"
                    style={{
                        background: colorBgContainer,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}

const siderStyle: React.CSSProperties = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
};

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
        token: { colorBgContainer, colorSplit },
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
            style={{
                ...siderStyle,
                background: colorBgContainer,
                borderRight: `1px solid ${colorSplit}`,
            }}
        >
            <Logo collapsed={collapsed} />
            <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                items={menuItems}
                style={{
                    background: colorBgContainer,
                    borderRight: "none",
                }}
                onClick={onMenuClick}
            />
        </Sider>
    );
}

function Logo({ collapsed }: { collapsed: boolean }) {
    const {
        token: { colorSplit },
    } = theme.useToken();

    return (
        <Flex
            justify="center"
            align="center"
            style={{ height: BarSize, borderBottom: `1px solid ${colorSplit}` }}
            gap={4}
        >
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            <Title
                className="motion-preset-blur-right"
                level={4}
                style={{ margin: 0, display: collapsed ? "none" : "block" }}
            >
                {APP_NAME}
            </Title>
        </Flex>
    );
}

function UserNameAndAvatar({ user }: { user: AuthUser }) {
    const menuItems = [
        {
            key: "1",
            icon: <SettingOutlined />,
            label: "Settings",
        },
        {
            key: "2",
            icon: <LogoutOutlined />,
            label: "Logout",
            danger: true,
        },
    ] satisfies Required<MenuProps["items"]>;

    const onMenuSettingsClick = () => {
        // TODO: implement settings
    };

    const onMenuLogoutClick = () => {
        // TODO: implement logout
    };

    const handleMenuClick: MenuProps["onClick"] = (e) => {
        const label =
            menuItems.find((item) => item.key === e.key)?.label ??
            "Unkonwn menu item";
        logger.debug(`User avatar dropdown menu: ${label} clicked`);
        switch (e.key) {
            case menuItems[0].key:
                onMenuSettingsClick();
                break;
            case menuItems[1].key:
                onMenuLogoutClick();
                break;
            default:
                break;
        }
    };

    const menuProps = {
        items: menuItems,
        onClick: handleMenuClick,
    } satisfies MenuProps;

    return (
        <Space className="hover:cursor-pointer flex">
            <Text>
                <strong>{user.lastName}</strong>
            </Text>
            <Dropdown menu={menuProps} trigger={["click"]}>
                <Avatar src={user.profileUrl} icon={<UserOutlined />} />
            </Dropdown>
        </Space>
    );
}
