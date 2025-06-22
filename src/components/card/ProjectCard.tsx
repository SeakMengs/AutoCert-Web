"use client";
import {
  App,
  Avatar,
  Badge,
  Button,
  Card,
  CardProps,
  Flex,
  Popconfirm,
  Skeleton,
  Tag,
  Tooltip,
} from "antd";
import React, { memo } from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScopedLogger } from "@/utils/logger";
import { deleteProjectByIdAction } from "@/app/dashboard/projects/action";
import { QueryKey } from "@/utils/react_query";
import PdfThumbnail from "../pdf/PdfThumbnail";

const logger = createScopedLogger("src:components:card:ProjectCard");

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

const GetBadgeIcon = ({ status }: { status: SignatoryStatus }) => {
  switch (status) {
    case SignatoryStatus.Signed:
      return (
        <CheckCircleFilled
          style={{
            color: "#52c41a",
            fontSize: "16px",
          }}
        />
      );
    case SignatoryStatus.Rejected:
      return (
        <CloseCircleFilled
          style={{
            color: "#ff4d4f",
            fontSize: "16px",
          }}
        />
      );
    case SignatoryStatus.Invited:
      return (
        <CloseCircleFilled
          style={{
            color: "#1677FF",
            fontSize: "16px",
          }}
        />
      );
    default:
      return null;
  }
};

function ProjectCard({ project, projectRole }: ProjectCardProps) {
  // const { src, loading, onLoadStart, onLoadingComplete, onError } = useImageSrc(
  //   `/api/proxy/projects/${project.id}/thumbnail`,
  // );
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { mutateAsync: handleRemoveProjectBydId, isPending: deleting } =
    useMutation({
      mutationFn: async () =>
        await deleteProjectByIdAction({
          projectId: project.id,
        }),
      onError: (error) => {
        logger.error("Failed to delete project", error);

        message.error(`Failed to delete project: ${project.title}`);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: [QueryKey.OwnProjects],
        });
      },
    });

  const getActions = (): CardProps["actions"] => {
    const actions: CardProps["actions"] = [];
    if (
      (project.status === ProjectStatus.Completed &&
        projectRole === ProjectRole.Requestor) ||
      projectRole === ProjectRole.Signatory
    ) {
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
        actions.push(
          <Popconfirm
            title={`Are you sure you want to delete the project "${project.title}"?`}
            onConfirm={async () => {
              await handleRemoveProjectBydId();
            }}
          >
            <Tooltip title="Delete">
              <Button
                variant="text"
                size="small"
                color="red"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
                disabled={deleting}
              />
            </Tooltip>
          </Popconfirm>,
        );
        break;
      case ProjectRole.Signatory:
        actions.push(
          <Tooltip title="Review Signature Request">
            <Link href={`/dashboard/projects/${project.id}/builder`}>
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
        <div className="relative w-full h-64 sm:h-48 xs:h-36">
          {/* <Image
            className={cn("rounded-sm object-cover w-full", {
              "opacity-0": loading,
            })}
            alt="Certificate Template"
            src={src}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onError={onError}
            onLoadStart={onLoadStart}
            onLoad={onLoadingComplete}
          />
          {loading && (
            <div className="absolute inset-0 z-10">
              <Skeleton.Image
                active
                className={cn("rounded-sm object-cover w-full h-full")}
              />
            </div>
          )} */}
          <PdfThumbnail
            pdfUrl={project.templateUrl}
            skeletonClassName="h-64 sm:h-48 xs:h-36"
          />
        </div>
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
                count={GetBadgeIcon({ status: s.status })}
                offset={[-5, 5]}
              >
                <Avatar src={s.profileUrl} alt={s.email}>
                  {s.email.substring(0, 2).toUpperCase()}
                </Avatar>
              </Badge>
            </Tooltip>
          ))}
        </Flex>
      </div>
    </Card>
  );
}

export default memo(ProjectCard);
