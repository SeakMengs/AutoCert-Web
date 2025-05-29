"use client";

import { useState } from "react";
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Space,
  Statistic,
  List,
  Avatar,
  Divider,
  Menu,
  Drawer,
} from "antd";
import {
  GoogleOutlined,
  SafetyCertificateOutlined as CertificateOutlined,
  EditOutlined,
  DatabaseOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { APP_NAME } from "@/utils";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function AutoCertLanding() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const features = [
    {
      icon: <CertificateOutlined className="text-4xl text-blue-600" />,
      title: "Bulk Certificate Creation",
      description: `Generate hundreds of certificates in minutes with our automated bulk creation system. Upload your pdf template and a CSV file with user data, and let ${APP_NAME} handle the rest.`,
    },
    {
      icon: <EditOutlined className="text-4xl text-blue-600" />,
      title: "E-Signing",
      description: "Easily request and sign e-signatures on certificates.",
    },
    {
      icon: <DatabaseOutlined className="text-4xl text-blue-600" />,
      title: "Certificate Repository",
      description:
        "Centralized storage and management of all your certificates. Search, share, download, and print capabilities.",
    },
  ];

  const LandingPageContent = () => (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" className="w-full">
                <Title
                  level={1}
                  className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
                >
                  Streamline Your Certificate Management with{" "}
                  <span className="text-blue-600">{APP_NAME}</span>
                </Title>
                <Paragraph className="text-lg text-gray-600 mb-6">
                  The complete platform for bulk certificate creation,
                  e-signing, and certificate repository.
                </Paragraph>
              </Space>
            </Col>
            <Col xs={24} lg={12} className="text-center">
              <Image
              src="/landing-illustration.svg"
              alt="AutoCert Illustration"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              className="max-w-full h-auto"
              priority
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-4">
              Powerful Features for Modern Certificate Management
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, sign, and manage certificates at
              scale
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow border-gray-200">
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4} className="text-gray-800 mb-3">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-600">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Title level={2} className="text-white mb-4">
            Ready to Transform Your Certificate Process?
          </Title>
          <Paragraph className="text-blue-100 text-lg mb-8">
            Join {APP_NAME} to streamline your certification workflows.
          </Paragraph>
          <Link href="/api/oauth/google">
            <Button
              type="default"
              size="large"
              icon={<GoogleOutlined />}
              className="h-12 px-8 text-lg font-medium"
            >
              Get Started with Google
            </Button>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="AutoCert Logo"
              width={48}
              height={48}
              priority
            />
          </Link>
          <Title level={3} className="text-blue-600 mb-0 font-bold">
            AutoCert
          </Title>
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

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          className="md:hidden"
          onClick={() => setMobileMenuVisible(true)}
        />

        {/* Mobile Drawer */}
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
                        <Link href="/api/oauth/google">Login with Google</Link>
                      ),
                    },
                  ]
            }
          />
        </Drawer>
      </Header>

      {/* Main Content */}
      <Content className="flex-1">
        <LandingPageContent />
      </Content>

      {/* Footer */}
      <Footer className="bg-gray-50 text-center border-t">
        <div className="max-w-6xl mx-auto px-4">
          <Paragraph className="text-gray-600 mb-2">
            © 2025 {APP_NAME}. All rights reserved.
          </Paragraph>
          {/* <Space split={<Divider type="vertical" />}>
            <Button type="link" className="text-gray-500">
              Privacy Policy
            </Button>
            <Button type="link" className="text-gray-500">
              Terms of Service
            </Button>
            <Button type="link" className="text-gray-500">
              Support
            </Button>
          </Space> */}
        </div>
      </Footer>
    </Layout>
  );
}
