"use client";

import { useState, useEffect } from "react";
import {
  List,
  Avatar,
  Typography,
  Spin,
  Empty,
  Flex,
  Space,
  Modal,
} from "antd";
import { z } from "zod";
import { getCertificatesByProjectIdSuccessResponseSchema } from "./schema";
import SignatoryStatusTag from "@/components/tag/SignatoryStatusTag";

const { Text } = Typography;

export type Signatory = z.infer<
  typeof getCertificatesByProjectIdSuccessResponseSchema
>["project"]["signatories"][number];

interface SignatoryListDialogProps {
  signatories: Signatory[];
  open: boolean;
  onClose: () => void;
}

export function SignatoryListDialog({
  signatories,
  open,
  onClose,
}: SignatoryListDialogProps) {
 return (
    <Modal
      title="Signatories"
      open={open}
      onCancel={() => onClose()}
      footer={null}
    >
      {signatories.length === 0 ? (
        <Flex className="w-full h-full" justify="center" align="center">
          <Empty description="No signatories found for this certificate" />
        </Flex>
      ) : (
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
                  backgroundColor: !signatory.profileUrl
                    ? "#1677ff"
                    : undefined,
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
      )}
    </Modal>
  );
}
