// import React from 'react'

// export default function DashboardProjects() {
//   return (
//     <div>DashboardProjects</div>
//   )
// }

"use client";
import React from "react";
import {
    CheckCircleFilled,
    CloseCircleFilled,
    DeleteOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import {
    Row,
    Col,
    Button,
    Card,
    Progress,
    Tag,
    Avatar,
    Dropdown,
    Menu,
    Tooltip,
    Badge,
} from "antd";

const CERTIFICATE_IMAGE_URL =
    "https://static.vecteezy.com/system/resources/previews/002/349/754/non_2x/modern-elegant-certificate-template-free-vector.jpg";

const CertificateCard = () => {
    // Example signatories data
    // `signed: true` -> Signed, `signed: false` -> Not signed
    const signatories = [
        {
            id: 1,
            name: "Alice",
            avatar: "https://i.pravatar.cc/40?u=alice",
            signed: true,
        },
        {
            id: 2,
            name: "Bob",
            avatar: "https://i.pravatar.cc/40?u=bob",
            signed: false,
        },
        {
            id: 3,
            name: "Charlie",
            avatar: "https://i.pravatar.cc/40?u=charlie",
            signed: true,
        },
    ];

    const totalSignatories = 4;
    const currentSignatories = signatories.filter((s) => s.signed).length;
    const progressPercent = (currentSignatories / totalSignatories) * 100;

    // Dropdown menu for the "More" button (now shows on hover)
    const menu = (
        <Menu
            items={[
                {
                    key: "delete",
                    label: "Delete",
                    icon: <DeleteOutlined />,
                    onClick: () => {
                        console.log("Delete clicked");
                        // Handle delete logic here...
                    },
                },
            ]}
        />
    );

    return (
        <Card
            hoverable
            style={{ width: 350 }}
            bodyStyle={{ padding: "1rem" }}
            cover={
                <img
                    alt="Certificate Template"
                    src={CERTIFICATE_IMAGE_URL}
                    style={{ objectFit: "cover", height: "200px" }}
                />
            }
        >
            {/* Top Row: Title, Created Date, and "More" dropdown (hover trigger) */}
            <Row justify="space-between" align="middle">
                <Col>
                    <h3 style={{ margin: 0 }}>Certificate of Excellence</h3>
                    <div style={{ color: "rgba(0,0,0,0.45)" }}>
                        Created 3 months ago
                    </div>
                </Col>
                <Col>
                    <Dropdown overlay={menu} trigger={["hover"]}>
                        <Button
                            shape="circle"
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()} // Prevent card click
                        />
                    </Dropdown>
                </Col>
            </Row>

            {/* Status Tag */}
            <Tag color="gold" style={{ marginTop: "1rem" }}>
                Pending
            </Tag>

            {/* Signatories Section */}
            <div style={{ marginTop: "1rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Signatories:</strong>{" "}
                    {`${currentSignatories}/${totalSignatories}`}
                </div>

                {/* Avatars (with check or close badges) */}
                <div
                    style={{ display: "flex", gap: 8, marginBottom: "0.5rem" }}
                >
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
                </div>

                {/* Progress bar to indicate how many have signed */}
                <Progress
                    percent={progressPercent}
                    strokeColor={{ from: "#108ee9", to: "#87d068" }}
                    status="active"
                    showInfo={false}
                />
            </div>
        </Card>
    );
};

const App = () => {
    return (
        <div style={{ padding: "2rem" }}>
            {/* Example heading or page title */}
            <h2>My Projects</h2>

            {/* Display multiple certificates in a responsive grid */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <CertificateCard />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <CertificateCard />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <CertificateCard />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <CertificateCard />
                </Col>
            </Row>
        </div>
    );
};

export default App;
