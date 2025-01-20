import React from "react";
import { Row, Col } from "antd";
import ProjectCard, { ProjectCardProps, ProjectSignatory, ProjectStatus } from "@/components/card/ProjectCard";

export default async function DashboardProject() {
  const mockProject = {
    title: "Environmental Protection Initiative",
    createdAt: new Date(),
    description: "A project aimed at reducing carbon emissions globally.",
    cover: "https://static.vecteezy.com/system/resources/previews/002/349/754/non_2x/modern-elegant-certificate-template-free-vector.jpg",
    status: ProjectStatus.Completed,
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

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={12} md={8} lg={6}>
          <ProjectCard
            {...mockProject}
            status={ProjectStatus.Preparing}
          />
        </Col>
      </Row>
    </div>
  );
}
