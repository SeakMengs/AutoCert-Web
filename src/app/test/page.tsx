"use client"

import { useState, useRef } from "react"
import { Layout, Menu, Button, Tabs, Card, Row, Col, Divider, Space, Typography, Upload } from "antd"
import {
  SaveOutlined,
  ExportOutlined,
  HomeOutlined,
  FileOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  UploadOutlined,
  FontSizeOutlined,
  PictureOutlined,
  EditOutlined,
} from "@ant-design/icons"
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch"

const { Header, Sider, Content } = Layout
const { Title } = Typography

const CertificateBuilder = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(2)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const transformComponentRef = useRef<ReactZoomPanPinchContentRef>(null)

  const certificateImage = "https://www.pngplay.com/wp-content/uploads/6/Training-Course-Certificate-PNG-HD-Quality.png"

  const templates = [
    { key: "classic", name: "Classic", image: "/placeholder.svg?height=100&width=100" },
    { key: "modern", name: "Modern", image: "/placeholder.svg?height=100&width=100" },
    { key: "elegant", name: "Elegant", image: "/placeholder.svg?height=100&width=100" },
    { key: "minimal", name: "Minimal", image: "/placeholder.svg?height=100&width=100" },
  ]

  const colorOptions = [
    "#1890ff", // Blue
    "#52c41a", // Green
    "#722ed1", // Purple
    "#faad14", // Yellow
    "#f5222d", // Red
  ]

  const handleZoomIn = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomOut()
    }
  }

  const handleReset = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform()
    }
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#1890ff",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "8px",
            }}
          >
            <span style={{ color: "white", fontWeight: "bold" }}>C</span>
          </div>
          {!collapsed && <span style={{ fontWeight: "bold" }}>CertifyPro</span>}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["templates"]}
          style={{ borderRight: 0 }}
          items={[
            {
              key: "dashboard",
              icon: <HomeOutlined />,
              label: "Dashboard",
            },
            {
              key: "templates",
              icon: <FileOutlined />,
              label: "Templates",
            },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: "Settings",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            height: "64px",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Certificate of Achievement
          </Title>
          <Space>
            <Button icon={<SaveOutlined />}>Save</Button>
            <Button icon={<ExportOutlined />} type="primary">
              Export
            </Button>
          </Space>
        </Header>
        <Content style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Space>
              <Button
                icon={<LeftOutlined />}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span style={{ padding: "0 8px" }}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                icon={<RightOutlined />}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setTotalPages((p) => p + 1)}>
                Add Page
              </Button>
            </Space>
            <Space>
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
              <Button icon={<UndoOutlined />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div
              style={{
                flex: 1,
                background: "#f5f5f5",
                padding: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <TransformWrapper
                ref={transformComponentRef}
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
                centerOnInit={true}
                minScale={0.5}
                maxScale={3}
                limitToBounds={false}
                doubleClick={{ disabled: true }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  contentStyle={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "800px",
                      maxWidth: "100%",
                      background: "white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={certificateImage || "/placeholder.svg"}
                      alt="Certificate Template"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </div>
                </TransformComponent>
              </TransformWrapper>
            </div>

            <div
              style={{
                width: "300px",
                background: "#fff",
                borderLeft: "1px solid #f0f0f0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Tabs
                defaultActiveKey="design"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
                tabBarStyle={{
                  margin: "0",
                  padding: "0 16px",
                  borderBottom: "1px solid #f0f0f0",
                }}
                items={[
                  {
                    key: "design",
                    label: "Design",
                    children: (
                      <div
                        style={{
                          padding: "16px",
                          overflowY: "auto",
                          height: "calc(100vh - 120px)",
                        }}
                      >
                        <div>
                          <Title level={5} style={{ marginTop: 0 }}>
                            Template
                          </Title>
                          <Row gutter={[16, 16]}>
                            {templates.map((template) => (
                              <Col span={12} key={template.key}>
                                <Card
                                  hoverable
                                  size="small"
                                  cover={
                                    <div
                                      style={{
                                        height: "80px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#f5f5f5",
                                      }}
                                    >
                                      <img
                                        alt={template.name}
                                        src={template.image || "/placeholder.svg"}
                                        style={{
                                          maxHeight: "100%",
                                          maxWidth: "100%",
                                          objectFit: "contain",
                                        }}
                                      />
                                    </div>
                                  }
                                  style={{
                                    border:
                                      selectedTemplate === template.key ? "2px solid #1890ff" : "1px solid #f0f0f0",
                                  }}
                                  onClick={() => setSelectedTemplate(template.key)}
                                >
                                  <Card.Meta
                                    title={template.name}
                                    style={{ textAlign: "center", margin: 0, padding: 0 }}
                                  />
                                </Card>
                              </Col>
                            ))}
                          </Row>

                          <Divider style={{ margin: "24px 0 16px" }} />

                          <Title level={5}>Upload Certificate Image</Title>
                          <Upload.Dragger maxCount={1} showUploadList={false} style={{ padding: "10px" }}>
                            <div style={{ padding: "16px 0" }}>
                              <p style={{ marginBottom: "8px" }}>
                                <UploadOutlined style={{ fontSize: "24px" }} />
                              </p>
                              <p>Upload</p>
                            </div>
                          </Upload.Dragger>

                          <Divider style={{ margin: "24px 0 16px" }} />

                          <Title level={5}>Colors</Title>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {colorOptions.map((color) => (
                              <div
                                key={color}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  background: color,
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  border: "1px solid #f0f0f0",
                                }}
                              />
                            ))}
                          </div>

                          <Divider style={{ margin: "24px 0 16px" }} />

                          <Title level={5}>Elements</Title>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Button icon={<FontSizeOutlined />} block style={{ display: "flex", alignItems: "center" }}>
                              Add Text
                            </Button>
                            <Button icon={<PictureOutlined />} block style={{ display: "flex", alignItems: "center" }}>
                              Add Image
                            </Button>
                            <Button icon={<EditOutlined />} block style={{ display: "flex", alignItems: "center" }}>
                              Add Signature
                            </Button>
                          </Space>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "fields",
                    label: "Fields",
                    children: (
                      <div style={{ padding: "16px" }}>
                        <p>Fields content</p>
                      </div>
                    ),
                  },
                  {
                    key: "data",
                    label: "Data",
                    children: (
                      <div style={{ padding: "16px" }}>
                        <p>Data content</p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default CertificateBuilder

