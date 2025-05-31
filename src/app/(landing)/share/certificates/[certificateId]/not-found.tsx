import { APP_NAME } from "@/utils";
import { Button, Card, Divider, Result } from "antd";
import { ExclamationCircleOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export default function CertificateNotFound () {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Result
          icon={<ExclamationCircleOutlined className="text-orange-500" />}
          title="Certificate Not Found"
          subTitle="The certificate you're looking for doesn't exist or has been moved. It may have been removed or the link might be incorrect."
          extra={[
            <Link href="/" key="home">
              <Button type="primary" size="large" icon={<HomeOutlined />}>
                Go to homepage
              </Button>
            </Link>,
          ]}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        />
        
        <Card className="mt-6 shadow-sm border-gray-200">
          <Title level={5} className="text-gray-800 mb-3">
            Common Reasons:
          </Title>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>The certificate has been deleted by the owner</li>
            <li>There's a typo in the certificate id</li>
            <li>The certificate's project is private</li>
          </ul>
          
          <Divider className="my-4" />
          
          <Paragraph className="text-gray-600 text-sm mb-0">
            If you believe this is an error, please contact the person who shared 
            this certificate with you.
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};
