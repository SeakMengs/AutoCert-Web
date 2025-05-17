import { PageSize } from "@/utils/pagination";
import { getOwnProjectsAction, GetOwnProjectsParams } from "./action";
import { ProjectRole } from "@/types/project";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/card/ProjectCard";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import FetchLoading from "@/components/loading/FetchLoading";
import { Flex, Empty, Row, Col, Pagination, Space } from "antd";
import { QueryKey } from "./certificate_project_section";

interface CertificateProjectListProps {
  queryParams: GetOwnProjectsParams;
  onPageChange: (page: number) => void;
}

export default function CertificateProjectList({
  queryParams,
  onPageChange,
}: CertificateProjectListProps) {
  const { page, search } = queryParams;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey, queryParams],
    queryFn: () => getOwnProjectsAction(queryParams),
  });

  const onErrorRetry = async (): Promise<void> => {
    refetch();
  };

  if (data && !data.success) {
    return (
      <Flex vertical align="center" justify="center">
        <DisplayZodErrors errors={data.errors} onRetry={onErrorRetry} />
      </Flex>
    );
  }

  const projects = data?.data?.projects || [];
  const total = data?.data?.total || 0;
  const pageSize = data?.data?.pageSize || PageSize;

  return (
    <Space direction="vertical" className="w-full">
      {isLoading ? (
        <Flex vertical align="center" justify="center">
          <FetchLoading />
        </Flex>
      ) : error ? (
        <Flex vertical align="center" justify="center">
          <DisplayZodErrors
            errors={{
              app: "An error occurred while getting projects",
            }}
            onRetry={onErrorRetry}
          />
        </Flex>
      ) : Array.isArray(projects) && projects.length === 0 ? (
        <Flex vertical align="center" justify="center">
          <Empty
            description={
              <p className="text-muted-foreground">
                No project found{" "}
                {search && (
                  <>
                    for <strong>{search}</strong>
                  </>
                )}
              </p>
            }
          />
        </Flex>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {projects.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={4}>
                <ProjectCard project={p} projectRole={ProjectRole.Requestor} />
              </Col>
            ))}
          </Row>
        </>
      )}
      {!isLoading && total > 0 && (
        <Pagination
          align="end"
          onChange={onPageChange}
          pageSize={pageSize}
          current={page}
          total={total}
          showQuickJumper
          responsive
          showTotal={(total, range): string =>
            `Showing ${range[0]}-${range[1]} of ${total} items`
          }
        />
      )}
    </Space>
  );
}
