import React from "react";
import { Row, Col } from "antd";
import ProjectCard, { ProjectCardProps, ProjectSignatory  } from "@/components/card/ProjectCard";
import moment from "moment";

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

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]} justify="start">
        <Col xs={24} sm={12} md={8} lg={6}>
          <ProjectCard
            {...mockProject}
          />
        </Col>
      </Row>
    </div>
  );
}
