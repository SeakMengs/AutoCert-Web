"use client";
import { useQuery } from "@tanstack/react-query";
import { getProjectByIdAction } from "./action";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import { Flex } from "antd";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import ProjectNotFound from "./not-found";
import ProjectBuilderWithProvider from "./builder_with_provider";
import { AuthUser } from "@/auth";
import { QueryKey } from "@/utils/react_query";

interface ProjectBuilderQueryProps {
  projectId: string;
  user: AuthUser;
}

export default function ProjectBuilderQuery({
  projectId,
  user,
}: ProjectBuilderQueryProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey.ProjectBuilderById, projectId],
    queryFn: async () => {
      return await getProjectByIdAction({ projectId });
    },

    // Refetch even when user navigate from other page to ensure data is up to date after they make changes (to avoid re-render pdf. only for this page)
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
      return <ProjectNotFound errorType="not-found" />;
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

  return (
    <ProjectBuilderWithProvider project={project} roles={roles} user={user} />
  );
}
