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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createScopedLogger } from "@/utils/logger";
import { AuthUser } from "@/auth";
import { logout } from "@/auth/server/action";
import Link from "next/link";
import { hasFullAccess } from "@/utils/restrict";

const logger = createScopedLogger("app:dashboard:layout_client");
const { Sider, Content } = Layout;
const { Text, Title } = Typography;

export const BarSize = 56;

export const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
};

interface DashboardLayoutClientProps {
  children: ReactNode;
  user: AuthUser;
}

export default function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const toggleCollapse = (): void => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="h-screen overflow-hidden" hasSider>
      <LeftSideBar
        toggleCollapse={toggleCollapse}
        collapsed={collapsed}
        user={user}
      />

      <Layout>
        <Content
          className="drop-shadow-sm overflow-auto"
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
  minHeight: "100vh",
  maxHeight: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

function LeftSideBar({
  collapsed,
  toggleCollapse,
  user,
}: {
  toggleCollapse: () => void;
  collapsed: boolean;
  user: AuthUser;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    ...(hasFullAccess(user.email)
      ? [
          {
            key: "projects",
            icon: <HomeOutlined />,
            label: "Projects",
            route: "/dashboard/projects",
          },
        ]
      : []),
    {
      key: "signature-request",
      icon: <SignatureOutlined />,
      label: "Signature request",
      route: "/dashboard/signature-request",
    },
  ] satisfies Array<Required<MenuProps>["items"][number] & { route: string }>;

  const selectedKey = menuItems.find((item) => {
    return pathname.toLowerCase() === item.route.toLowerCase();
  })?.key;

  const {
    token: { colorBgContainer, colorSplit },
  } = theme.useToken();

  const onMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find((item) => item.key === key);
    if (item) {
      // router.push(`${item.route}?${searchParams.toString()}`);
      router.push(`${item.route}`);
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={BarSize}
      className="z-50"
      style={{
        ...siderStyle,
        background: colorBgContainer,
        borderRight: `1px solid ${colorSplit}`,
      }}
    >
      <Flex className="h-full" vertical justify="space-between">
        <div>
          <Logo collapsed={collapsed} />
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={[selectedKey ?? ""]}
            style={{
              background: colorBgContainer,
              borderRight: "none",
            }}
            onClick={onMenuClick}
          />
        </div>
        <div>
          <UserNameAndAvatar collapsed={collapsed} user={user} />
        </div>
      </Flex>
      <Button
        shape="circle"
        size="small"
        type="text"
        icon={collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
        onClick={toggleCollapse}
        className="absolute top-1/2 right-[-10px] shadow-sm"
      />
    </Sider>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  const {
    token: { colorSplit },
  } = theme.useToken();

  return (
    <Link href={"/"}>
      <Flex
        justify="center"
        align="center"
        style={{ height: BarSize, borderBottom: `1px solid ${colorSplit}` }}
        // gap={4}
      >
        <Image src="/logo.svg" alt="logo" width={48} height={48} />
        <Title
          level={3}
          style={{
            display: collapsed ? "none" : "block",
          }}
          className="motion-preset-blur-right m-0 text-blue-600"
        >
          {APP_NAME}
        </Title>
      </Flex>
    </Link>
  );
}

function UserNameAndAvatar({
  collapsed,
  user,
}: {
  user: AuthUser;
  collapsed: boolean;
}) {
  const router = useRouter();
  const {
    token: { colorSplit },
  } = theme.useToken();

  const logoutKey = "logout";

  const menuItems = [
    // {
    //   key: "1",
    //   icon: <SettingOutlined />,
    //   label: "Settings",
    // },
    {
      key: logoutKey,
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ] satisfies Required<MenuProps["items"]>;

  const onMenuLogoutClick = async () => {
    await logout();
    logger.debug("User logged out");

    router.push("/");
  };

  const handleMenuClick: MenuProps["onClick"] = async (e) => {
    const label =
      menuItems.find((item) => item.key === e.key)?.label ??
      "Unkonwn menu item";
    logger.debug(`User avatar dropdown menu: ${label} clicked`);
    switch (e.key) {
      case logoutKey:
        await onMenuLogoutClick();
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
    <Flex
      className="motion-preset-confetti"
      justify="center"
      align="center"
      style={{
        height: BarSize,
        borderTop: `1px solid ${colorSplit}`,
      }}
      gap={4}
    >
      <Dropdown menu={menuProps} trigger={["click"]}>
        <Space className="hover:cursor-pointer">
          <Avatar src={user.profileUrl} icon={<UserOutlined />}>
            {user.email.substring(0, 2).toUpperCase()}
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <Text className="block font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {user.lastName}
              </Text>
              <Text
                type="secondary"
                className="text-xs whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {user.email}
              </Text>
            </div>
          )}
        </Space>
      </Dropdown>
    </Flex>
  );
}
