"use client";
import React, { useEffect, useRef, useState } from "react";
import ProjectCard from "@/components/card/ProjectCard";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import {
  Col,
  Empty,
  Flex,
  Input,
  Pagination,
  Row,
  Select,
  SelectProps,
  Space,
  Typography,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectStatusTag } from "@/components/tag/SelectStatusTag";
import CreateProjectDialog from "./create_project_dioalog";
import {
  ProjectRole,
  ProjectStatus,
  ProjectStatusLabels,
} from "@/types/project";
import useAsync from "@/hooks/useAsync";
import { getOwnProjectsAction, GetOwnProjectsParams } from "./action";
import { PageSize } from "@/utils/pagination";
import FetchLoading from "@/components/loading/FetchLoading";
import debounce from "lodash.debounce";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";

const { Search } = Input;
const { Title } = Typography;

// 0.5 seconds
const DEBOUNCE_MS = 500;

export default function CertificateProjectSection() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPage = searchParams.get("page") || 1;
  const querySearch = searchParams.get("search") || "";
  const queryStatus =
    searchParams
      .get("filters")
      ?.split(",")
      .filter((f) => f !== "") || Object.values(ProjectStatus);

  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    querySearch,
  );
  const [selectedStatus, setSelectedStatus] = useState<
    string[] | ProjectStatus[]
  >(queryStatus);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<
    string | undefined
  >(searchQuery);
  const [page, setPage] = useState<number>(Number(queryPage));

  const statusOptions = Object.values(ProjectStatus).map((status) => ({
    value: status,
    label: ProjectStatusLabels[status],
  })) satisfies SelectProps["options"];

  const getOwnProjects = useAsync(getOwnProjectsAction, {
    defaultLoading: true,
  });

  const debounceSearch = useRef(
    debounce(async (val: GetOwnProjectsParams) => {
      const newSearchParams = new URLSearchParams({
        search: val.search || "",
        page: String(val.page),
      });

      Array.isArray(val.status) &&
        val.status.forEach((s) => {
          newSearchParams.append("status", s.toString());
        });

      router.replace(`?${newSearchParams.toString()}`);
      await getOwnProjects.fetchData(val);

      setDebouncedSearchQuery(val.search);
    }, DEBOUNCE_MS),
  ).current;

  const projects = getOwnProjects.data?.projects || [];
  const totalPage = getOwnProjects.data?.totalPage || 0;
  const total = getOwnProjects.data?.total || 0;
  const pageSize = getOwnProjects.data?.pageSize || PageSize;

  useEffect(() => {
    debounceSearch({
      page: page > totalPage ? 1 : page,
      // pageSize: PageSize,
      pageSize: 2,
      search: searchQuery,
      status: selectedStatus.map((filter) => Number(filter) as ProjectStatus),
    });

    return () => {
      // Cancel the debounce on unmount
      debounceSearch.cancel();
    };
  }, [searchQuery, selectedStatus, page, router, debounceSearch]);

  const onSearchChange = (value: string): void => {
    setSearchQuery(value);
  };

  const onStatusChange = (value: string[]): void => {
    setSelectedStatus(value);
  };

  const onPageChange = (p: number, pSize: number): void => {
    setPage(p);
  };

  const onErrorRetry = async () => {
    await debounceSearch({
      page: Number(page),
      pageSize: PageSize,
      search: searchQuery,
      status: selectedStatus.map((filter) => Number(filter) as ProjectStatus),
    });
  };

  return (
    <>
      <Space direction="vertical" size={"middle"} className="w-full">
        <div className="flex justify-between items-center">
          <Title level={4} className="m-0">
            Certificate Project
          </Title>
          <CreateProjectDialog onCreated={() => {}} />
        </div>
        <Flex vertical gap={16}>
          <Search
            placeholder="Search by project title"
            allowClear
            enterButton={<SearchOutlined />}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-[450px]"
          />
          <Select
            defaultValue={selectedStatus}
            labelRender={(labelProps) => labelProps.label}
            mode="multiple"
            placeholder="Filter by status"
            options={statusOptions}
            onChange={(value) => onStatusChange(value as string[])}
            allowClear
            suffixIcon={<FilterOutlined />}
            className="w-full max-w-[450px]"
            tagRender={SelectStatusTag}
          />
        </Flex>

        {getOwnProjects.loading ? (
          <Flex vertical align="center" justify="center">
            <FetchLoading />
          </Flex>
        ) : getOwnProjects.error ? (
          <Flex vertical align="center" justify="center">
            <DisplayZodErrors
              errors={getOwnProjects.error}
              onRetry={onErrorRetry}
            />
          </Flex>
        ) : Array.isArray(projects) && projects.length === 0 ? (
          <Flex vertical align="center" justify="center">
            <Empty
              description={
                <p className="text-muted-foreground">
                  No project found{" "}
                  {debouncedSearchQuery && (
                    <>
                      for <strong>{debouncedSearchQuery}</strong>
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
                  <ProjectCard project={p} projectRole={ProjectRole.Owner} />
                </Col>
              ))}
            </Row>
          </>
        )}
        <Pagination
          align="end"
          onChange={onPageChange}
          pageSize={pageSize}
          defaultCurrent={page}
          total={total}
          showQuickJumper
          responsive
          showTotal={(total, range): string =>
            `Showing ${range[0]}-${range[1]} of ${total} items`
          }
        />
      </Space>
    </>
  );
}
