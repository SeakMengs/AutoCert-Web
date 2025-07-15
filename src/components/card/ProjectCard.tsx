"use client";
import {
  App,
  Avatar,
  Badge,
  Button,
  Card,
  CardProps,
  Dropdown,
  Flex,
  Menu,
  MenuProps,
  Modal,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { memo, useState } from "react";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SignatureOutlined,
  ToolOutlined,
  MoreOutlined,
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
} from "@/types/project";
import { useImageSrc } from "@/hooks/useImageSrc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScopedLogger } from "@/utils/logger";
import { deleteProjectByIdAction } from "@/app/dashboard/projects/action";
import { QueryKey } from "@/utils/react_query";
import PdfThumbnail from "../pdf/PdfThumbnail";
import { wait } from "@/utils";

const logger = createScopedLogger("src:components:card:ProjectCard");

export type ProjectCardProps = {
  project: z.infer<typeof ProjectSchema>;
  projectRole: ProjectRole;
};

export const StatusColorMap = {
  [ProjectStatus.Draft]: "default",
  [ProjectStatus.Processing]: "processing",
  [ProjectStatus.Completed]: "success",
};

const { Meta } = Card;
const { Title, Text } = Typography;

const GetStatusIcon = ({ status }: { status: ProjectStatus }) => {
  switch (status) {
    case ProjectStatus.Draft:
      return <EditOutlined />;
    case ProjectStatus.Processing:
      return <LoadingOutlined spin />;
    case ProjectStatus.Completed:
      return <CheckCircleOutlined />;
    default:
      return null;
  }
};

function ProjectCard({ project, projectRole }: ProjectCardProps) {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const { mutateAsync: handleRemoveProjectBydId, isPending: deleting } =
    useMutation({
      mutationFn: async () =>
        await deleteProjectByIdAction({ projectId: project.id }),
      onError: (error) => {
        logger.error("Failed to delete project", error);
        message.error(`Failed to delete project: ${project.title}`);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: [QueryKey.OwnProjects],
        });
        setMenuOpen(false);
      },
    });

  const showDeleteConfirm = () => {
    modal.confirm({
      title: `Delete "${project.title}"?`,
      content: "Are you sure you want to delete this project?",
      okText: "Delete",
      okType: "danger",
      maskClosable: true,
      onOk: async () => {
        await handleRemoveProjectBydId();
        message.success(`Project "${project.title}" deleted successfully.`);
      },
      onCancel: () => setMenuOpen(false),
    });
  };

  const getDropdownMenuItems = (): MenuProps["items"] => {
    const items: MenuProps["items"] = [];

    if (project.status === ProjectStatus.Completed) {
      items.push({
        key: "view-certs",
        label: (
          <Link href={`/dashboard/projects/${project.id}/certificates`}>
            View Generated Certificates
          </Link>
        ),
        icon: <EyeOutlined />,
      });
    }

    if (projectRole === ProjectRole.Requestor) {
      items.push(
        {
          key: "builder",
          label: (
            <Link href={`/dashboard/projects/${project.id}/builder`}>
              Template Builder
            </Link>
          ),
          icon: <ToolOutlined />,
        },
        {
          key: "delete",
          label: <span className="text-red-600">Delete</span>,
          icon: <DeleteOutlined className="text-red-500" />,
          onClick: showDeleteConfirm,
        },
      );
    }

    if (projectRole === ProjectRole.Signatory) {
      items.push({
        key: "sign",
        label: (
          <Link href={`/dashboard/projects/${project.id}/builder`}>
            Review Signature Request
          </Link>
        ),
        icon: <SignatureOutlined />,
      });
    }

    return items;
  };

  return (
    <Card
      className="border rounded-sm hover:shadow-sm relative group w-full"
      cover={
        <Link href={`/dashboard/projects/${project.id}/builder`}>
          <div className="relative w-full h-64 sm:h-48 xs:h-36">
            <PdfThumbnail
              pdfUrl={project.templateUrl}
              skeletonClassName="h-64 sm:h-48 xs:h-36"
            />
          </div>
        </Link>
      }
    >
      <div className="flex justify-between items-start gap-2">
        <Tooltip
          title={`Project title: ${project.title}`}
          className="flex-1 min-w-0"
        >
          <Link href={`/dashboard/projects/${project.id}/builder`}>
            <Title
              level={5}
              className="truncate hover:text-blue-600 transition-colors line-clamp-2"
            >
              {project.title}
            </Title>
          </Link>
        </Tooltip>

        <Dropdown
          menu={{ items: getDropdownMenuItems() }}
          trigger={["click"]}
          open={menuOpen}
          onOpenChange={(open) => setMenuOpen(open)}
        >
          <Button
            size="small"
            type="text"
            variant="filled"
            icon={<MoreOutlined />}
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Dropdown>
      </div>

      <Flex gap={8} align="center" justify="space-between" className="mt-2">
        <Tooltip title="Project status">
          <Tag
            color={StatusColorMap[project.status]}
            icon={GetStatusIcon({ status: project.status })}
          >
            {ProjectStatusLabels[project.status]}
          </Tag>
        </Tooltip>
        <Space
          direction="vertical"
          size={4}
          style={{ marginBottom: 8, color: "rgba(0, 0, 0, 0.45)" }}
        >
          <Flex align="center" gap={8}>
            <CalendarOutlined />
            <Text type="secondary">{moment(project.createdAt).fromNow()}</Text>
          </Flex>
        </Space>
      </Flex>
    </Card>
  );
}

export default memo(ProjectCard);
