"use client";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Dropdown,
    Flex,
    Menu,
    MenuProps,
    Progress,
    Row,
    Tag,
    Tooltip,
} from "antd";
import React from "react";
import {
    CheckCircleFilled,
    CloseCircleFilled,
    DeleteOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import Image from "next/image";

export type ProjectSignatory = {
    id: number;
    name: string;
    avatar: string;
    signed: boolean;
};

export type ProjectCardProps = {
    title: string;
    description: string;
    cover: string;
    status: ProjectStatus;
    createdAt: Date | string;
    signatories: ProjectSignatory[];
};

export enum ProjectStatus {
    // When the project is being prepared
    Preparing = "Preparing",
    // When all signatories have been invited to the project
    Pending = "Pending",
    // When all signatories have signed the project and the server is processing the certificates
    Processing = "Processing",
    // When the certificates are ready
    Completed = "Completed",
}

const StatusColorMap = {
    [ProjectStatus.Preparing]: "default",
    [ProjectStatus.Pending]: "processing",
    [ProjectStatus.Processing]: "warning",
    [ProjectStatus.Completed]: "success",
};

export default function ProjectCard({
    title,
    description,
    cover,
    status,
    createdAt,
    signatories,
}: ProjectCardProps) {
    console.log(`Status ${status}, Color ${StatusColorMap[status]}, Enum ${ProjectStatus.Completed}`);

    return (
        <Card
            hoverable
            style={{ width: 350 }}
            cover={
                <Image
                    alt="Certificate Template"
                    src={cover}
                    objectFit="cover"
                    height={200}
                    width={350}
                />
            }
        >
            <Row justify="space-between" align="middle">
                <Col>
                    <h1 style={{ margin: 0 }}>
                        <strong>{title}</strong>
                    </h1>
                    <div style={{ color: "rgba(0,0,0,0.45)" }}>
                        Created {new Date(createdAt).toLocaleDateString()}
                    </div>
                </Col>
                <Col>
                    <Button
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                    />
                </Col>
            </Row>

            {/* Status Tag */}
            <Tag color={StatusColorMap[status]} style={{ marginTop: "1rem" }}>
                {status}
            </Tag>
            <Tag color="gold" style={{ marginTop: "1rem" }}>
                Why
            </Tag>

            {/* Signatories Section */}
            <div style={{ marginTop: "1rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Signatories:</strong>{" "}
                    {`${signatories.filter((s) => s.signed).length}/${
                        signatories.length
                    }`}
                </div>

                {/* Avatars (with check or close badges) */}
                <Flex gap={8} style={{ marginBottom: "0.5rem" }}>
                    {signatories.map((signatory) => (
                        <Tooltip title={signatory.name} key={signatory.id}>
                            <Badge
                                count={
                                    signatory.signed ? (
                                        <CheckCircleFilled
                                            style={{
                                                color: "#52c41a",
                                                fontSize: "16px",
                                            }}
                                        />
                                    ) : (
                                        <CloseCircleFilled
                                            style={{
                                                color: "#ff4d4f",
                                                fontSize: "16px",
                                            }}
                                        />
                                    )
                                }
                                offset={[-5, 5]}
                            >
                                <Avatar src={signatory.avatar}>
                                    {signatory.name.charAt(0)}
                                </Avatar>
                            </Badge>
                        </Tooltip>
                    ))}
                </Flex>
            </div>
        </Card>
    );
}
