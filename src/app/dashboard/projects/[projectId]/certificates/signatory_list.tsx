"use client";

import { useState, useEffect } from "react";
import { List, Avatar, Typography, Spin, Empty, Flex } from "antd";
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
    <List
      itemLayout="horizontal"
      dataSource={signatories}
      renderItem={(signatory) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar
                src={signatory.profileUrl}
                style={{
                  backgroundColor: !signatory.profileUrl
                    ? "#1677ff"
                    : undefined,
                }}
              >
                {!signatory.profileUrl
                  ? signatory.email.substring(0, 2).toUpperCase()
                  : null}
              </Avatar>
            }
            title={signatory.email}
            description={
              <div>
                <SignatoryStatusTag status={signatory.status} />
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
