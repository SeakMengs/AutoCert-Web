import React from "react";
import ProjectCard, {
    ProjectCardProps,
    ProjectSignatory,
} from "@/components/card/ProjectCard";
import moment from "moment";
import { Flex, Space } from "antd";

export default function DashboardProject() {
    const mockProject = {
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

    const mockProjects = Array(20).fill(mockProject);

    return (
        <Space size={"large"} wrap>
            {mockProjects.map((project, index) => (
                <ProjectCard key={index} {...project} />
            ))}
        </Space>
    );
}
