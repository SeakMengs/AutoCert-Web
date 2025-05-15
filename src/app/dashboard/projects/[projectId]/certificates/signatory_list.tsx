"use client";

import { useState, useEffect } from "react";
import { List, Avatar, Typography, Spin, Empty, Flex, Space } from "antd";
import { z } from "zod";
import { getCertificatesByProjectIdSuccessResponseSchema } from "./schema";
import SignatoryStatusTag from "@/components/tag/SignatoryStatusTag";

const { Text } = Typography;

export type Signatory = z.infer<
  typeof getCertificatesByProjectIdSuccessResponseSchema
>["project"]["signatories"][number];

interface SignatoryListProps {
  signatories: Signatory[];
}

export function SignatoryList({ signatories }: SignatoryListProps) {
  if (signatories.length === 0) {
    return (
      <Flex className="w-full h-full" justify="center" align="center">
        <Empty description="No signatories found for this certificate" />
      </Flex>
    );
  }

  return (
    <Space direction="vertical" className="w-full h-full">
      {signatories.map((signatory, index) => (
        <Space
          key={`${index}-${signatory.email}`}
          className="w-full h-full"
          align="center"
        >
          <Avatar
            size={"large"}
            src={signatory.profileUrl}
            style={{
              backgroundColor: !signatory.profileUrl ? "#1677ff" : undefined,
            }}
          >
            {signatory.email.substring(0, 2).toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={2}>
            <Text>{signatory.email}</Text>
            <SignatoryStatusTag status={signatory.status} />
          </Space>
        </Space>
      ))}
    </Space>
  );
}
