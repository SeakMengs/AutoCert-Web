"use client";
import React, { useEffect, useRef, useState } from "react";
import ProjectCard from "@/components/card/ProjectCard";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import {
  Col,
  Empty,
  Flex,
  Input,
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
import { getOwnProjects, GetOwnProjectsParams } from "./action";
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

  const page = searchParams.get("page") || 1;
  const querySearch = searchParams.get("search") || "";
  const queryStatus =
    searchParams
      .get("filters")
      ?.split(",")
      .filter((f) => f !== "") || Object.values(ProjectStatus);

  const [searchQuery, setSearchQuery] = useState<string>(querySearch);
  const [selectedStatus, setSelectedStatus] = useState<
    string[] | ProjectStatus[]
  >(queryStatus);

  const statusOptions = Object.values(ProjectStatus).map((status) => ({
    value: status,
    label: ProjectStatusLabels[status],
  })) satisfies SelectProps["options"];

  const getProject = useAsync(getOwnProjects, {
    defaultLoading: true,
  });

  const debounceSearch = useRef(
    debounce(async (val: GetOwnProjectsParams) => {
      const newSearchParams = new URLSearchParams({
        search: val.search || "",
        page: String(page),
      });

      selectedStatus.forEach((s) => {
        newSearchParams.append("status", s.toString());
      });

      router.replace(`?${newSearchParams.toString()}`);
      await getProject.fetchData(val);
    }, DEBOUNCE_MS),
  ).current;

  const projects = getProject.data?.projects || [];

  useEffect(() => {
    debounceSearch({
      page: Number(page),
      pageSize: PageSize,
      search: searchQuery,
      status: selectedStatus.map((filter) => Number(filter) as ProjectStatus),
    });

    return () => {
      // Cancel the debounce on unmount
      debounceSearch.cancel();
    };
  }, [searchQuery, selectedStatus, router, debounceSearch]);

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const onStatusChange = (value: string[]) => {
    setSelectedStatus(value);
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

        {getProject.loading ? (
          <Flex vertical align="center" justify="center">
            <FetchLoading />
          </Flex>
        ) : getProject.error ? (
          <Flex vertical align="center" justify="center">
            <DisplayZodErrors
              errors={getProject.error}
              onRetry={onErrorRetry}
            />
          </Flex>
        ) : Array.isArray(projects) && projects.length === 0 ? (
          <Flex vertical align="center" justify="center">
            <Empty description="No projects found" />
          </Flex>
        ) : (
          <Row gutter={[16, 16]}>
            {projects.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={4}>
                <ProjectCard project={p} projectRole={ProjectRole.Owner} />
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </>
  );
}
