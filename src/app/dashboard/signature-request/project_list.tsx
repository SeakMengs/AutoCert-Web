import { PageSize } from "@/utils/pagination";
import { ProjectRole, ProjectStatus } from "@/types/project";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/card/ProjectCard";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import FetchLoading from "@/components/loading/FetchLoading";
import { Flex, Empty, Row, Col, Pagination } from "antd";
import {
  getSignatoryProjectsAction,
  GetSignatoryProjectsParams,
} from "./action";
import { QueryKey } from "./signature_request_section";

interface SignatoryProjectListProps {
  search: string | undefined;
  page: number;
  status: string[] | ProjectStatus[];
  onPageChange: (page: number) => void;
}

export default function SignatoryProjectList({
  page,
  search,
  status,
  onPageChange,
}: SignatoryProjectListProps) {
  const queryParams: GetSignatoryProjectsParams = {
    page: Number(page),
    pageSize: PageSize,
    search: search,
    status: status.map((s) => Number(s) as ProjectStatus),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey, queryParams],
    queryFn: () => getSignatoryProjectsAction(queryParams),
  });

  const onErrorRetry = async () => {
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
    <>
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
                {search ? (
                  <>
                    No signature request found for project{" "}
                    <strong>{search}</strong>
                  </>
                ) : (
                  <>No signature requests</>
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
                <ProjectCard project={p} projectRole={ProjectRole.Signatory} />
              </Col>
            ))}
          </Row>
        </>
      )}
      {!isLoading && (
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
    </>
  );
}
