import { Button, Row, Col, Card, Space } from "antd";
import {
  GoogleOutlined,
  SafetyCertificateOutlined as CertificateOutlined,
  EditOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/utils";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import LoginLink from "@/components/auth/LoginLink";

export default function AutoCertLanding() {
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
        "Storage and management of all your generated certificates with share, download, and print capabilities.",
    },
  ];

  return (
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
                className="max-w-[380] h-auto"
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
            <LoginLink>
            <Button
              type="primary"
              size="large"
              icon={<GoogleOutlined />}
              className="h-12 px-8 text-lg font-medium bg-white text-blue-600 border-none hover:bg-blue-50 hover:text-blue-700"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              Get started with Google
            </Button>
            </LoginLink>
        </div>
      </div>
    </>
  );
}
