"use client";
// TODO: separate server and client
import React, { useEffect, useState } from "react";
import ProjectCard, {
    ProjectCardProps,
    ProjectSignatory,
    ProjectStatus,
    StatusColorMap,
} from "@/components/card/ProjectCard";
import moment from "moment";
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
    Tag,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";

const { Search } = Input;

export default function DashboardProject() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const mockProject = {
        id: nanoid(),
        title: "Environmental Protection Initiative",
        createdAt: moment().subtract(1, "day").toDate(),
        cover: "https://marketplace.canva.com/EAFy42rCTA0/1/0/1600w/canva-blue-minimalist-certificate-of-achievement-_asVJz8YgJE.jpg",
        status: "Completed",
        signatories: [
            {
                id: 1,
                name: "Alice Johnson",
                avatar: "https://i.pravatar.cc/40?u=alice",
                signed: true,
            },
            {
                id: 2,
                name: "Bob Smith",
                avatar: "https://i.pravatar.cc/40?u=bob",
                signed: false,
            },
            {
                id: 3,
                name: "Charlie Davis",
                avatar: "https://i.pravatar.cc/40?u=jonh",
                signed: true,
            },
            {
                id: 4,
                name: "Diana Ross",
                avatar: "https://i.pravatar.cc/40?u=jack",
                signed: false,
            },
        ] satisfies ProjectSignatory[],
    } satisfies ProjectCardProps;

    // Copy but random date and name
    const mockProjects = Array.from({ length: 20 }, (_, index) => ({
        ...mockProject,
        id: nanoid(),
        title: `Project ${index + 1}`,
        createdAt: moment().subtract(index, "days").toDate(),
        status: Object.values(ProjectStatus)[index % 4],
    }));

    const querySearch = searchParams.get("search") || "";
    const queryFilters = searchParams.get("filters")
        ? searchParams.get("filters")!.split(",")
        : Object.values(ProjectStatus);

    const [searchQuery, setSearchQuery] = useState<string>(querySearch);
    const [selectedFilters, setSelectedFilters] =
        useState<string[]>(queryFilters);

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set("search", searchQuery);
        }

        if (Array.isArray(selectedFilters) && selectedFilters.length) {
            params.set("filters", selectedFilters.join(","));
        } else {
            params.delete("filters");
        }

        router.replace(`?${params.toString()}`);
    }, [searchQuery, selectedFilters, router]);

    const statusOptions = Object.values(ProjectStatus).map((status) => ({
        value: status,
        label: status,
    })) satisfies SelectProps["options"];

    const filteredProjects = mockProjects.filter((project) => {
        const matchesSearch = project.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            Array.isArray(selectedFilters) &&
            selectedFilters.includes(project.status);
        return matchesSearch && matchesStatus;
    });

    return (
        <Space direction="vertical" size={"middle"} className="w-full">
            <Flex vertical gap={16}>
                <Search
                    placeholder="Search by project title"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-[450px]"
                />
                <Select
                    defaultValue={selectedFilters}
                    mode="multiple"
                    placeholder="Filter by status"
                    options={statusOptions}
                    onChange={(value) => setSelectedFilters(value as string[])}
                    allowClear
                    suffixIcon={<FilterOutlined />}
                    className="w-full max-w-[450px]"
                    tagRender={TagRender}
                />
            </Flex>

            {Array.isArray(filteredProjects) &&
            filteredProjects.length === 0 ? (
                <Flex vertical align="center" justify="center">
                    <Empty description="No projects found" />
                </Flex>
            ) : (
                <Row gutter={[16, 16]}>
                    {filteredProjects.map((project, index) => (
                        <Col key={index} xs={24} sm={12} md={8} lg={4}>
                            <ProjectCard {...project} />
                        </Col>
                    ))}
                </Row>
            )}
        </Space>
    );
}

const TagRender: SelectProps["tagRender"] = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <Tag
            color={StatusColorMap[value as keyof typeof StatusColorMap]}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginInlineEnd: 4 }}
        >
            {label}
        </Tag>
    );
};
