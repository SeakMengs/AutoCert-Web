// Error components must be Client Components
"use client";
import { useEffect } from "react";
import { Button, Result, Typography } from "antd";
import {
  CloseCircleOutlined,
  HomeOutlined,
  LeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { createScopedLogger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { IS_PRODUCTION } from "@/utils/env";

const { Paragraph, Text } = Typography;

export const logger = createScopedLogger("src:app:(landing):error");

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    logger.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Result
          status="error"
          title="Something went wrong!"
          subTitle="We encountered an unexpected error while processing your request."
          extra={[
            <Button
              key="try-again"
              icon={<ReloadOutlined />}
              onClick={() => reset()}
            >
              Try Again
            </Button>,
            <Button
              key="go-back"
              type="default"
              icon={<LeftOutlined />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>,
            <Link href="/" key="home">
              <Button icon={<HomeOutlined />}>Back to Home</Button>
            </Link>,
          ]}
        >
          {!IS_PRODUCTION && <div className="desc">
            <Paragraph>
              <Text
                strong
                style={{
                  fontSize: 16,
                }}
              >
                Error Details (Development Only):
              </Text>
            </Paragraph>
            <Paragraph>
              <CloseCircleOutlined className="site-result-demo-error-icon text-red-500" />{" "}
              Message: {error.message}
            </Paragraph>
            <Paragraph>
              <CloseCircleOutlined className="site-result-demo-error-icon text-red-500" />{" "}
              Digest: {error.digest || "No digest available"}
            </Paragraph>
          </div>}
        </Result>
      </div>
    </div>
  );
}
