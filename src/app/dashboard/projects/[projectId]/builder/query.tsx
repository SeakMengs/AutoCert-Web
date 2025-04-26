"use client";
import { useQuery } from "@tanstack/react-query";
import Builder from "./builder";
import { getProjectByIdAction } from "./action";
import { notFound } from "next/navigation";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import { Flex } from "antd";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import ProjectNotFound from "./not-found";

interface ProjectBuilderByIdProps {
  projectId: string;
}

const QueryKey = "project_builder_by_id";

export default function ProjectBuilderById({
  projectId,
}: ProjectBuilderByIdProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey, projectId],
    queryFn: async () => {
      return await getProjectByIdAction({ projectId });
    },

    // Refetch even when user navigate from other page to ensure data is up to date after they make changes
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0,
  });

  const onErrorRetry = async (): Promise<void> => {
    refetch();
  };

  if (isLoading) {
    return <FullScreenSpin />;
  }

  if (error) {
    return (
      <Flex vertical align="center" justify="center">
        <DisplayZodErrors
          errors={{
            app: "An error occurred while getting project data",
          }}
          onRetry={onErrorRetry}
        />
      </Flex>
    );
  }

  if (data && !data.success) {
    if (Object.hasOwn(data.errors, "notFound")) {
      return notFound();
    }

    if (Object.hasOwn(data.errors, "forbidden")) {
      return <ProjectNotFound errorType="forbidden" />;
    }

    return (
      <Flex vertical align="center" justify="center">
        <DisplayZodErrors errors={data.errors} onRetry={onErrorRetry} />
      </Flex>
    );
  }

  const project = data?.data.project;
  const roles = data?.data.roles;

  if (!project || !roles) {
    return <FullScreenSpin />;
  }

  return <Builder project={project} roles={roles} />;
}
