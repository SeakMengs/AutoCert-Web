"use client";
import { useQuery } from "@tanstack/react-query";
import CertificateList from "./certificate_list";
import Header from "./header";
import { Flex, Pagination, Space } from "antd";
import { getCertificatesByProjectIdAction } from "./action";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import ProjectNotFound from "@/components/not_found/ProjectNotFound";
import { QueryKey } from "@/utils/react_query";
import { PageSize } from "@/utils/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectCertificatesByIdProps {
  projectId: string;
}

export default function ProjectCertificatesById({
  projectId,
}: ProjectCertificatesByIdProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPage = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState<number>(queryPage);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey.ProjectCertificatesById, projectId, page],
    queryFn: async () => {
      return await getCertificatesByProjectIdAction({
        projectId,
        page: page,
        pageSize: PageSize,
      });
    },
  });

  const onPageChange = (page: number): void => {
    setPage(page);
  };

  useEffect(() => {
    const newSearchParams = new URLSearchParams({
      page: String(page),
    });

    router.replace(`?${newSearchParams.toString()}`);
  }, [page, router]);

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
  const total = data?.data?.total || 0;
  const pageSize = data?.data?.pageSize || PageSize;

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
        certificateMergedUrl={project.certificateMergedUrl}
        certificateZipUrl={project.certificateZipUrl}
      />
      <Space direction="vertical" size={"middle"} className="w-full p-4">
        <CertificateList
          setPage={onPageChange}
          page={page}
          totalCertificates={total}
          certificates={project.certificates}
          projectId={projectId}
          isPublic={project.isPublic}
        />
        {!isLoading && total > 0 && (
          <Pagination
            align="end"
            onChange={onPageChange}
            pageSize={pageSize}
            current={page}
            total={total}
            showQuickJumper
            showSizeChanger={false}
            responsive
            showTotal={(total, range): string =>
              `Showing ${range[0]}-${range[1]} of ${total} items`
            }
          />
        )}
      </Space>
    </>
  );
}
