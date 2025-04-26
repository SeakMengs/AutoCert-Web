"use client";
import { IS_PRODUCTION } from "@/utils/env";
import { T_ZodErrorFormatted } from "@/utils/error";
import React, { useState } from "react";
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Button, Result, Tooltip, Typography } from "antd";

const { Paragraph, Text } = Typography;

export default function DisplayZodErrors<T>({
  errors,
  onRetry,
}: {
  onRetry?: () => void | Promise<void>;
  errors: T_ZodErrorFormatted<T>;
}) {
  const [retryLoading, setRetryLoading] = useState<boolean>(false);

  const handleRetry = async () => {
    if (onRetry) {
      setRetryLoading(true);
      await onRetry();
      setRetryLoading(false);
    }
  };
  return (
    <Result
      className="w-full max-w-2xl"
      status="error"
      title="An error occurred"
      subTitle="Please check the following errors:"
      extra={
        onRetry && (
          <Button onClick={handleRetry} loading={retryLoading}>
            Retry
          </Button>
        )
      }
    >
      {Object.entries(errors).map(([key, value]) => {
        const isUnknownKey = key.toLowerCase() === "unknown";
        const errorMessage = value as string;

        return (
          <Tooltip key={key} title={errorMessage}>
            <Paragraph
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 0,
                cursor: "help", // Indicates it's hoverable
              }}
            >
              <ExclamationCircleOutlined
                style={{
                  color: "#ff4d4f",
                  marginRight: 8,
                }}
              />
              {IS_PRODUCTION ? (
                <Text type="danger">
                  {isUnknownKey ? "Something went wrong" : errorMessage}
                </Text>
              ) : (
                <>
                  <Text strong>
                    {key}
                    <Text
                      type="secondary"
                      style={{ marginLeft: 4, fontSize: 12 }}
                    >
                      (Dev only)
                    </Text>
                    {": "}
                  </Text>
                  <Text type="danger" style={{ marginLeft: 4 }}>
                    {errorMessage}
                  </Text>
                </>
              )}
            </Paragraph>
          </Tooltip>
        );
      })}
    </Result>
  );
}
