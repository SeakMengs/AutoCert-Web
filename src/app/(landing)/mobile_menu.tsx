"use client";

import { Button, Drawer, Menu } from "antd";
import Link from "next/link";
import { useState } from "react";
import {
  GoogleOutlined,
  MenuOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import LoginLink from "@/components/auth/LoginLink";

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        className="md:hidden"
        onClick={() => setMobileMenuVisible(true)}
      />
      
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          className="border-0"
          items={
            isAuthenticated
              ? [
                  {
                    key: "dashboard",
                    icon: <DashboardOutlined />,
                    label: <Link href="/dashboard">Dashboard</Link>,
                  },
                ]
              : [
                  {
                    key: "login",
                    icon: <GoogleOutlined />,
                    label: (
                      <LoginLink>Login with Google</LoginLink>
                    ),
                  },
                ]
          }
        />
      </Drawer>
    </>
  );
}