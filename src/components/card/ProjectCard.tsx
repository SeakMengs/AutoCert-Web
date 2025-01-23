"use client";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Dropdown,
    Flex,
    MenuProps,
    Tag,
    Tooltip,
} from "antd";
import React, { useState } from "react";
import {
    CheckCircleFilled,
    CloseCircleFilled,
    DeleteOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import moment from "moment";
import { cn } from "@/utils";

export type ProjectSignatory = {
    id: number;
    name: string;
    avatar: string;
    signed: boolean;
};

export type ProjectCardProps = {
    title: string;
    cover: string;
    status: (typeof ProjectStatus)[keyof typeof ProjectStatus];
    createdAt: Date | string;
    signatories: ProjectSignatory[];
};

export const ProjectStatus = {
    // When the project is being prepared
    Preparing: "Preparing",
    // When all signatories have been invited to the project
    Pending: "Pending",
    // When all signatories have signed the project and the server is processing the certificates
    Processing: "Processing",
    // When the certificates are ready
    Completed: "Completed",
} as const;

const StatusColorMap = {
    [ProjectStatus.Preparing]: "default",
    [ProjectStatus.Pending]: "processing",
    [ProjectStatus.Processing]: "warning",
    [ProjectStatus.Completed]: "success",
};

const { Meta } = Card;

export default function ProjectCard({
    title,
    cover,
    status,
    createdAt,
    signatories,
}: ProjectCardProps) {
    const [dropDownOpen, setDropDownOpen] = useState<boolean>(false);
    const menuItems = [
        {
            key: "1",
            icon: <DeleteOutlined />,
            label: "Delete",
        },
    ] satisfies Required<MenuProps>["items"];

    const handleMenuClick: MenuProps["onClick"] = (e) => {
        console.log("click", e);
    };

    const menuProps = {
        items: menuItems,
        onClick: handleMenuClick,
    };

    return (
        <Card
            className="shadow-sm relative group"
            hoverable
            style={{ width: 280 }}
            cover={
                <Image
                    className="object-cover"
                    alt="Certificate Template"
                    src={cover}
                    height={140}
                    width={280}
                />
            }
        >
            <Dropdown
                className={cn({
                    ["invisible group-hover:visible group-hover:motion-preset-bounce"]:
                        !dropDownOpen,
                })}
                menu={menuProps}
                trigger={["click"]}
                placement="bottomLeft"
                open={dropDownOpen}
                onOpenChange={(open) => setDropDownOpen(open)}
            >
                <Tooltip title="More Options">
                    <Button
                        type="default"
                        icon={<MoreOutlined />}
                        style={{
                            position: "absolute",
                            right: 16,
                            top: 16,
                        }}
                    />
                </Tooltip>
            </Dropdown>

            <Meta
                title={
                    <Tooltip title={`Project title: ${title}`}>{title}</Tooltip>
                }
                description={
                    <Flex gap={8} align="center" justify="space-between">
                        <Tag color={StatusColorMap[status]}>{status}</Tag>
                        <span>{moment(createdAt).fromNow()}</span>
                    </Flex>
                }
            />

            {/* Signatories Section */}
            <div style={{ marginTop: "1rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Signatories signed:</strong>{" "}
                    {`${signatories.filter((s) => s.signed).length}/${
                        signatories.length
                    }`}
                </div>

                {/* Avatars (with check or close badges) */}
                <Flex gap={8}>
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
