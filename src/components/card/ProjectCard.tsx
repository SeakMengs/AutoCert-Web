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
import { z } from "zod";
import { ProjectSchema } from "@/schemas/autocert_api/project";
import {
  ProjectRole,
  ProjectStatus,
  ProjectStatusLabels,
  SignatoryStatus,
  SignatoryStatusLabels,
} from "@/types/project";

const logger = createScopedLogger("components:card:ProjectCard");

export type ProjectCardProps = {
  project: z.infer<typeof ProjectSchema>;
  projectRole: ProjectRole;
};

export const StatusColorMap = {
  [ProjectStatus.Preparing]: "default",
  [ProjectStatus.Processing]: "warning",
  [ProjectStatus.Completed]: "success",
};

const { Meta } = Card;

export default function ProjectCard({
  project,
  projectRole,
}: ProjectCardProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const getActions = (): CardProps["actions"] => {
    switch (projectRole) {
      case ProjectRole.Requestor:
        return [
          <Tooltip title="View Generated Certificates">
            <Link href={`/dashboard/projects/${project.id}/certificates`}>
              <EyeOutlined
                disabled={project.status != ProjectStatus.Completed}
              />
            </Link>
          </Tooltip>,
          <Tooltip title="Template Builder">
            <Link href={`/dashboard/projects/${project.id}/builder`}>
              <ToolOutlined />
            </Link>
          </Tooltip>,
        ];
      case ProjectRole.Signatory:
        return [
          <Tooltip title="View Generated Certificates">
            <Link href={`/dashboard/projects/${project.id}/certificates`}>
              <EyeOutlined
                disabled={project.status != ProjectStatus.Completed}
              />
            </Link>
          </Tooltip>,
          <Tooltip title="Approve signature request">
            <Link href={`/dashboard/projects/${project.id}/sign`}>
              <SignatureOutlined />
            </Link>
          </Tooltip>,
        ];
    }
  };

  useEffect(() => {
    // delay loading state for 1 second
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 300);
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
            className="rounded-sm object-cover w-full"
            style={{
              width: 256,
              height: 144,
            }}
          />
        ) : (
          <Image
            className="rounded-sm object-cover w-full h-auto"
            alt="Certificate Template"
            src={"/placeholder.svg"}
            width={256}
            height={144}
            unoptimized
          />
        )
      }
      actions={getActions()}
    >
      <Meta
        title={
          <Tooltip title={`Project title: ${project.title}`}>
            {project.title}
          </Tooltip>
        }
        description={
          <Flex gap={8} align="center" justify="space-between">
            <Tooltip title="Project status">
              <Tag color={StatusColorMap[project.status]}>
                {ProjectStatusLabels[project.status]}
              </Tag>
            </Tooltip>
            <span>{moment(project.createdAt).fromNow()}</span>
          </Flex>
        }
      />

      {/* Signatories Section */}
      <div style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Signatories signed:</strong>{" "}
          {`${project.signatories.filter((s) => s.status === SignatoryStatus.Signed).length}/${
            project.signatories.length
          }`}
        </div>

        {/* Avatars (with check or close badges) */}
        <Flex gap={8} wrap>
          {project.signatories.map((s, i) => (
            <Tooltip
              title={`${s.email}: ${SignatoryStatusLabels[s.status].toLowerCase()}`}
              key={`${s.email}-${i}`}
            >
              <Badge
                count={
                  s.status === SignatoryStatus.Signed ? (
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
                <Avatar src={s.profileUrl} alt={s.email}></Avatar>
              </Badge>
            </Tooltip>
          ))}
        </Flex>
      </div>
    </Card>
  );
}
