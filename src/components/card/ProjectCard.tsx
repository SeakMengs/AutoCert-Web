"use client";
import {
  Avatar,
  Badge,
  Card,
  CardProps,
  Flex,
  Skeleton,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  SignatureOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import moment from "moment";
import { createScopedLogger } from "@/utils/logger";
import Link from "next/link";

const logger = createScopedLogger("components:card:ProjectCard");

export type ProjectSignatory = {
  id: number;
  name: string;
  avatar: string;
  signed: boolean;
};

export type ProjectCardProps = {
  id: string;
  title: string;
  cover: string;
  status: (typeof ProjectStatus)[keyof typeof ProjectStatus];
  createdAt: Date | string;
  signatories: ProjectSignatory[];
  userRole: "owner" | "signatory";
};

export const ProjectStatus = {
  // When the project is being prepared
  Preparing: "Preparing",
  // When all signatories have signed the project and the server is processing the certificates
  Processing: "Processing",
  // When the certificates are ready
  Completed: "Completed",
} as const;

export const StatusColorMap = {
  [ProjectStatus.Preparing]: "default",
  [ProjectStatus.Processing]: "warning",
  [ProjectStatus.Completed]: "success",
};

const { Meta } = Card;

export default function ProjectCard({
  id,
  title,
  cover,
  status,
  createdAt,
  signatories,
  userRole,
}: ProjectCardProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const getActions = (): CardProps["actions"] => {
    switch (userRole) {
      case "owner":
        return [
          <EyeOutlined disabled={status != ProjectStatus.Completed} />,
          <Link href={`/dashboard/projects/${id}/builder`}>
            <ToolOutlined />
          </Link>,
          // <DeleteOutlined className="hover:text-red-500" />,
        ];
      case "signatory":
        return [
          <EyeOutlined disabled={status != ProjectStatus.Completed} />,
          <Link href={`/dashboard/projects/${id}/sign`}>
            <SignatureOutlined />
          </Link>,
        ];
    }
  };

  useEffect(() => {
    // delay loading state for 1 second
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Card
      loading={loading}
      className="border rounded-sm hover:shadow-sm relative group w-full"
      cover={
        loading ? (
          <Skeleton.Image
            active
            className="rounded-sm w-full object-cover h-36"
          />
        ) : (
          <Image
            className="rounded-sm object-cover w-full h-auto"
            alt="Certificate Template"
            src={cover}
            width={256}
            height={144}
            unoptimized
          />
        )
      }
      actions={getActions()}
    >
      <Meta
        title={<Tooltip title={`Project title: ${title}`}>{title}</Tooltip>}
        description={
          <Flex gap={8} align="center" justify="space-between">
            <Tag color={StatusColorMap[status]}>{status}</Tag>
            <span>{moment(createdAt).fromNow()}</span>
          </Flex>
        }
      />

      {/* Signatories Section */}
      <div style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Signatories signed:</strong>{" "}
          {`${signatories.filter((s) => s.signed).length}/${
            signatories.length
          }`}
        </div>

        {/* Avatars (with check or close badges) */}
        <Flex gap={8} wrap>
          {signatories.map((signatory) => (
            <Tooltip title={signatory.name} key={signatory.id}>
              <Badge
                count={
                  signatory.signed ? (
                    <CheckCircleFilled
                      style={{
                        color: "#52c41a",
                        fontSize: "16px",
                      }}
                    />
                  ) : (
                    <CloseCircleFilled
                      style={{
                        color: "#ff4d4f",
                        fontSize: "16px",
                      }}
                    />
                  )
                }
                offset={[-5, 5]}
              >
                <Avatar src={signatory.avatar}>
                  {signatory.name.charAt(0)}
                </Avatar>
              </Badge>
            </Tooltip>
          ))}
        </Flex>
      </div>
    </Card>
  );
}
