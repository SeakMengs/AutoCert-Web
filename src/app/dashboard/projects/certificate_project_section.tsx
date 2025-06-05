"use client";
import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Flex, Input, Select, SelectProps, Space, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectStatusTag } from "@/components/tag/SelectStatusTag";
import CreateProjectDialog, {
} from "./create_project_dioalog";
import { ProjectStatus, ProjectStatusLabels } from "@/types/project";
import debounce from "lodash.debounce";
import CertificateProjectList from "./project_list";

const { Search } = Input;
const { Title } = Typography;
const DEBOUNCE_MS = 500; // 0.5 seconds

const statusOptions = Object.values(ProjectStatus).map((status) => ({
  value: status,
  label: ProjectStatusLabels[status],
})) satisfies SelectProps["options"];

export default function CertificateProjectSection() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPage = searchParams.get("page") || 1;
  const querySearch = searchParams.get("search") || "";
  let queryStatus = searchParams
    .getAll("status")
    .filter((f) => statusOptions.some((o) => o.value.toString() === f))
    .map((f) => Number(f)) as ProjectStatus[];

  if (queryStatus.length === 0) {
    queryStatus = Object.values(ProjectStatus);
  }

  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    querySearch,
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<
    string | undefined
  >(querySearch);
  const [selectedStatus, setSelectedStatus] =
    useState<ProjectStatus[]>(queryStatus);
  const [page, setPage] = useState<number>(Number(queryPage));

  const debounceSearch = useRef(
    debounce((value: string | undefined) => {
      setDebouncedSearchQuery(value);
    }, DEBOUNCE_MS),
  ).current;

  useEffect(() => {
    debounceSearch(searchQuery);

    return () => {
      debounceSearch.cancel();
    };
  }, [searchQuery, debounceSearch]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams({
      search: debouncedSearchQuery || "",
      page: String(page),
    });

    Array.isArray(selectedStatus) &&
      selectedStatus.forEach((s) => {
        newSearchParams.append("status", s.toString());
      });

    router.replace(`?${newSearchParams.toString()}`);
  }, [debouncedSearchQuery, selectedStatus, page, router]);

  const onSearchChange = (value: string): void => {
    setSearchQuery(value);

    // Reset to first page on new search
    setPage(1);
  };

  const onStatusChange = (value: ProjectStatus[]): void => {
    setSelectedStatus(value);

    // Reset to first page on new filter
    setPage(1);
  };

  const onPageChange = (p: number): void => {
    setPage(p);
  };

  return (
    <>
      <Space direction="vertical" size={"middle"} className="w-full">
        <div className="flex justify-between items-center">
          <Title level={4} className="m-0">
            Certificate Project
          </Title>
        </div>
        <Flex vertical gap={16}>
          <div className="flex-nowrap"><CreateProjectDialog /></div>
          <Search
            placeholder="Search by project title"
            allowClear
            enterButton={<SearchOutlined />}
            onChange={(e) => onSearchChange(e.target.value)}
            value={searchQuery}
            className="w-full max-w-[450px]"
          />
          <Select
            value={selectedStatus}
            labelRender={(labelProps) => labelProps.label}
            mode="multiple"
            placeholder="Filter by status"
            options={statusOptions}
            onChange={(value) => onStatusChange(value)}
            allowClear
            suffixIcon={<FilterOutlined />}
            className="w-full max-w-[450px]"
            tagRender={SelectStatusTag}
          />
        </Flex>

        <CertificateProjectList
          onPageChange={onPageChange}
          queryParams={{
            page,
            search: debouncedSearchQuery,
            status: selectedStatus,
          }}
        />
      </Space>
    </>
  );
}
