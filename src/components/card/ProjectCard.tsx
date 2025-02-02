"use client";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Dropdown,
    Flex,
    MenuProps,
    Skeleton,
    Tag,
    Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import {
    CheckCircleFilled,
    CloseCircleFilled,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import moment from "moment";
import { cn } from "@/utils";
import { createScopedLogger } from "@/utils/logger";
import Link from "next/link";

const logger = createScopedLogger("components:card:ProjectCard");

export type ProjectSignatory = {
    id: number;
    name: string;
    avatar: string;
    signed: boolean;
};

export type ProjectCardProps = {
    id: string;
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

export const StatusColorMap = {
    [ProjectStatus.Preparing]: "default",
    [ProjectStatus.Pending]: "processing",
    [ProjectStatus.Processing]: "warning",
    [ProjectStatus.Completed]: "success",
};

const { Meta } = Card;

export default function ProjectCard({
    id,
    title,
    cover,
    status,
    createdAt,
    signatories,
}: ProjectCardProps) {
    const [loading, setLoading] = useState<boolean>(true);
    // const [dropDownOpen, setDropDownOpen] = useState<boolean>(false);
    // const menuItems = [
    //     {
    //         key: "1",
    //         icon: <DeleteOutlined />,
    //         label: "Delete",
    //     },
    // ] satisfies Required<MenuProps>["items"];

    // const handleMenuClick: MenuProps["onClick"] = (e) => {
    //     const label =
    //         menuItems.find((item) => item.key === e.key)?.label ??
    //         "Unkonwn menu item";
    //     logger.debug(`Project card dropdown menu: ${label} clicked`);

    //     switch (e.key) {
    //         case menuItems[0].key:
    //             onMenuDeleteClick();
    //             break;
    //         default:
    //             break;
    //     }
    // };

    // const onMenuDeleteClick = () => {};

    // const menuProps = {
    //     items: menuItems,
    //     onClick: handleMenuClick,
    // } satisfies MenuProps;

    useEffect(() => {
        // delay loading state for 1 second
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Card
            loading={loading}
            className="border hover:shadow-sm relative group w-full"
            cover={
                loading ? (
                    <Skeleton.Image
                        active
                        className="w-full object-cover h-36"
                    />
                ) : (
                    <Image
                        className="object-cover w-full h-auto"
                        alt="Certificate Template"
                        src={cover}
                        width={256}
                        height={144}
                        unoptimized
                    />
                )
            }
            actions={[
                <EyeOutlined
                    key="view"
                    disabled={status != ProjectStatus.Completed}
                />,
                <Link href={`/dashboard/projects/${id}/builder`}>
                    <EditOutlined key={"edit"} />
                </Link>,
                <DeleteOutlined key="delete" className="hover:text-red-500" />,
            ]}
        >
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
                <Flex gap={8} wrap>
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
