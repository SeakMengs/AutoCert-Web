"use client";
import { useQuery } from "@tanstack/react-query";
import CertificateList from "./certificate_list";
import Header from "./header";
import { Flex, Space } from "antd";
import { getCertificatesByProjectIdAction } from "./action";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import { notFound } from "next/navigation";
import ProjectNotFound from "@/components/not_found/ProjectNotFound";
import { QueryKey } from "@/utils/react_query";

interface ProjectCertificatesByIdProps {
  projectId: string;
}

export default function ProjectCertificatesById({
  projectId,
}: ProjectCertificatesByIdProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey.ProjectCertificatesById, projectId],
    queryFn: async () => {
      return await getCertificatesByProjectIdAction({ projectId });
    },
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
            app: "An error occurred while getting certificates data",
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

  return (
    <>
      <Header
        id={project.id}
        isPublic={project.isPublic}
        logs={project.logs}
        signatories={project.signatories}
        title={project.title}
      />
      <Space direction="vertical" size={"middle"} className="w-full p-4">
        <CertificateList
          certificates={project.certificates}
          projectId={projectId}
          isPublic={project.isPublic}
        />
      </Space>
    </>
  );
}
