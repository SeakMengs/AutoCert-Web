import { APP_NAME } from "@/utils";
import { Button, Divider, Space } from "antd";
import Link from "next/link";
import Image from "next/image";
import { PropsWithChildren } from "react";
import { validateAccessToken } from "@/auth/server/action";
import { GoogleOutlined, DashboardOutlined } from "@ant-design/icons";
import { MobileMenu } from "./mobile_menu";
import Layout, { Content, Footer, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export default async function LandingLayout({ children }: PropsWithChildren) {
  const { isAuthenticated } = await validateAccessToken();

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="AutoCert Logo"
              width={48}
              height={48}
              priority
            />
            <Title level={3} className="text-blue-600 mb-0 font-bold">
              AutoCert
            </Title>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <Space>
              <Link href="/dashboard">
                <Button type="text" icon={<DashboardOutlined />}>
                  Dashboard
                </Button>
              </Link>
            </Space>
          ) : (
            <Space>
              <Link href={"/api/oauth/google"}>
                <Button type="primary" icon={<GoogleOutlined />}>
                  Login
                </Button>
              </Link>
            </Space>
          )}
        </div>

        <MobileMenu isAuthenticated={isAuthenticated} />
      </Header>

      {/* Main Content */}
      <Content className="flex-1">{children}</Content>

      {/* Footer */}
      <Footer className="bg-gray-50 text-center border-t">
        <div className="max-w-6xl mx-auto px-4">
          <Paragraph className="text-gray-600 mb-2">
            © 2025 {APP_NAME}. All rights reserved.
          </Paragraph>
          <Space split={<Divider type="vertical" />}>
            <Button type="link" className="text-gray-500">
              Bulk Certificate Creation
            </Button>
            <Button type="link" className="text-gray-500">
              E-Signing
            </Button>
            <Button type="link" className="text-gray-500">
              Certificate Repository
            </Button>
          </Space>
        </div>
      </Footer>
    </Layout>
  );
}
