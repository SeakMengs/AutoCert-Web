"use client";
import { Avatar, Badge, Card, CardProps, Flex, Tag, Tooltip } from "antd";
import React, { memo } from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  SignatureOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import moment from "moment";
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
import { useImageSrc } from "@/hooks/useImageSrc";

export type ProjectCardProps = {
  project: z.infer<typeof ProjectSchema>;
  projectRole: ProjectRole;
};

export const StatusColorMap = {
  [ProjectStatus.Draft]: "default",
  [ProjectStatus.Processing]: "warning",
  [ProjectStatus.Completed]: "success",
};

const { Meta } = Card;

function ProjectCard({ project, projectRole }: ProjectCardProps) {
  const { src, onError } = useImageSrc(
    `/api/proxy/projects/${project.id}/thumbnail`,
  );

  const getActions = (): CardProps["actions"] => {
    const actions: CardProps["actions"] = [];
    if (project.status === ProjectStatus.Completed) {
      actions.push(
        <Tooltip title="View Generated Certificates">
          <Link href={`/dashboard/projects/${project.id}/certificates`}>
            <EyeOutlined />
          </Link>
        </Tooltip>,
      );
    }

    switch (projectRole) {
      case ProjectRole.Requestor:
        actions.push(
          <Tooltip title="Template Builder">
            <Link href={`/dashboard/projects/${project.id}/builder`}>
              <ToolOutlined />
            </Link>
          </Tooltip>,
        );
        break;
      case ProjectRole.Signatory:
        actions.push(
          <Tooltip title="Approve signature request">
            <Link href={`/dashboard/projects/${project.id}/sign`}>
              <SignatureOutlined />
            </Link>
          </Tooltip>,
        );
        break;
    }

    return actions;
  };

  return (
    <Card
      // loading={loading}
      className="border rounded-sm hover:shadow-sm relative group w-full"
      cover={
        <Image
          className="rounded-sm object-cover w-full"
          alt="Certificate Template"
          src={src}
          onError={onError}
          width={256}
          height={256}
          quality={100}
        />
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
                        color: "#1677FF",
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

export default memo(ProjectCard);
