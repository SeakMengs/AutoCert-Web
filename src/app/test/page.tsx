"use client"

import { useState } from "react"
import {
  Layout,
  Typography,
  Button,
  Tabs,
  Collapse,
  Space,
  Switch,
  Input,
  Slider,
  Select,
  Divider,
  Table,
  Checkbox,
  Pagination,
  Form,
  Avatar,
  Card,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd"
import {
  QrcodeOutlined,
  PlusOutlined,
  SettingOutlined,
  TableOutlined,
  FileImageOutlined,
  FontSizeOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  CopyOutlined,
  AppstoreOutlined,
  FormOutlined,
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons"

const { Header, Content, Footer, Sider } = Layout
const { Title, Text } = Typography
const { TabPane } = Tabs
const { Panel } = Collapse
const { Option } = Select

export default function CertificateEditorPanel() {
  const [activeTab, setActiveTab] = useState("elements")
  const [qrCodeEnabled, setQrCodeEnabled] = useState(false)
  const [qrCodeData, setQrCodeData] = useState("https://certificate-verification.example.com/verify/123456")
  const [qrCodeSize, setQrCodeSize] = useState(100)

  // Table data
  const columns = [
    {
      title: <Checkbox />,
      dataIndex: "select",
      key: "select",
      width: 50,
      render: () => <Checkbox />,
    },
    {
      title: "name2",
      dataIndex: "name2",
      key: "name2",
    },
    {
      title: "name2_1",
      dataIndex: "name2_1",
      key: "name2_1",
    },
    {
      title: "name3",
      dataIndex: "name3",
      key: "name3",
    },
  ]

  const data = [
    {
      key: "1",
      name2: "123213",
      name2_1: "12312312",
      name3: "312",
    },
  ]

  // Sample data for text fields
  const textFields: TextFieldType[] = [
    {
      id: "1",
      name: "recipientName",
      label: "Recipient Name",
      type: "text",
      placeholder: "Enter recipient name",
      visible: true,
    },
    {
      id: "2",
      name: "certificateId",
      label: "Certificate ID",
      type: "text",
      defaultValue: "CERT-{####}",
      visible: true,
    },
    {
      id: "3",
      name: "issueDate",
      label: "Issue Date",
      type: "date",
      visible: true,
    },
  ]

  // Sample data for signatories
  const signatories: SignatoryType[] = [
    {
      id: "1",
      email: "john.doe@example.com",
      status: "signed",
      invitedAt: "2024-03-01T10:00:00Z",
      signedAt: "2024-03-01T11:30:00Z",
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      status: "invited",
      invitedAt: "2024-03-01T10:00:00Z",
    },
    {
      id: "3",
      email: "mark.wilson@example.com",
      status: "not_invited",
    },
  ]

  // Handler functions
  const handleEditField = (id: string) => {
    console.log("Edit field:", id)
  }

  const handleDeleteField = (id: string) => {
    console.log("Delete field:", id)
  }

  const handleToggleFieldVisibility = (id: string) => {
    console.log("Toggle field visibility:", id)
  }

  const handleInviteSignatory = (id: string) => {
    console.log("Invite signatory:", id)
  }

  const handleRemoveSignatory = (id: string) => {
    console.log("Remove signatory:", id)
  }

  const handleResendInvite = (id: string) => {
    console.log("Resend invite:", id)
  }

  return (
    <Layout style={{ width: 320, height: "100%", borderLeft: "1px solid #f0f0f0" }}>
      <Header
        style={{
          height: 64,
          padding: "0 16px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Certificate Editor
        </Title>
        <Button type="text" icon={<SettingOutlined />} />
      </Header>

      <Content style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
          tabBarStyle={{ margin: "0 16px", paddingTop: 8 }}
        >
          <TabPane
            tab={
              <span>
                <AppstoreOutlined /> Elements
              </span>
            }
            key="elements"
            style={{ height: "100%", overflow: "auto", padding: "16px" }}
          >
            <Collapse defaultActiveKey={["text-fields"]} bordered={false} expandIconPosition="end">
              <Panel
                header={
                  <span>
                    <FontSizeOutlined /> Text Fields
                  </span>
                }
                key="text-fields"
                style={{ marginBottom: 8 }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <Button icon={<PlusOutlined />} block>
                    Add Text Field
                  </Button>

                  {textFields.map((field) => (
                    <TextFieldCard
                      key={field.id}
                      field={field}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                      onToggleVisibility={handleToggleFieldVisibility}
                    />
                  ))}
                </Space>
              </Panel>

              <Panel
                header={
                  <span>
                    <FileImageOutlined /> Images
                  </span>
                }
                key="images"
                style={{ marginBottom: 8 }}
              >
                <Button icon={<PlusOutlined />} block>
                  Add Image
                </Button>
              </Panel>

              <Panel
                header={
                  <span>
                    <FormOutlined /> Signatories
                  </span>
                }
                key="signatories"
                style={{ marginBottom: 8 }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <Button icon={<PlusOutlined />} block>
                    Add Signatory
                  </Button>

                  {signatories.map((signatory) => (
                    <SignatoryCard
                      key={signatory.id}
                      signatory={signatory}
                      onInvite={handleInviteSignatory}
                      onRemove={handleRemoveSignatory}
                      onResend={handleResendInvite}
                    />
                  ))}
                </Space>
              </Panel>

              <Panel
                header={
                  <span>
                    <QrcodeOutlined /> QR Code
                  </span>
                }
                key="qr-code"
                style={{ marginBottom: 8 }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text>Enable QR Code</Text>
                    <Switch checked={qrCodeEnabled} onChange={setQrCodeEnabled} />
                  </div>

                  {qrCodeEnabled && (
                    <>
                      <Form layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item label="QR Code Data">
                          <Input
                            value={qrCodeData}
                            onChange={(e) => setQrCodeData(e.target.value)}
                            placeholder="Enter URL or text"
                          />
                        </Form.Item>

                        <Form.Item label={`Size: ${qrCodeSize}px`}>
                          <Slider min={50} max={200} step={5} value={qrCodeSize} onChange={setQrCodeSize} />
                        </Form.Item>

                        <Form.Item label="Position">
                          <Select defaultValue="bottom-right" style={{ width: "100%" }}>
                            <Option value="top-left">Top Left</Option>
                            <Option value="top-right">Top Right</Option>
                            <Option value="bottom-left">Bottom Left</Option>
                            <Option value="bottom-right">Bottom Right</Option>
                            <Option value="custom">Custom</Option>
                          </Select>
                        </Form.Item>
                      </Form>

                      <div style={{ marginTop: 16 }}>
                        <Text>QR Code Preview</Text>
                        <div
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 4,
                            padding: 16,
                            marginTop: 8,
                            display: "flex",
                            justifyContent: "center",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <div
                            style={{
                              width: 96,
                              height: 96,
                              backgroundColor: "white",
                              padding: 8,
                              borderRadius: 4,
                              border: "1px solid #f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <QrcodeOutlined style={{ fontSize: 80 }} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Space>
              </Panel>
            </Collapse>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TableOutlined /> Data
              </span>
            }
            key="data"
            style={{ height: "100%", overflow: "auto", padding: "16px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Input.Group compact>
                <Input style={{ width: "calc(100% - 40px)" }} placeholder="Search data..." />
                <Button icon={<SearchOutlined />} />
              </Input.Group>

              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Table Management</Text>
                  <Space>
                    <Button size="small" icon={<PlusOutlined />}>
                      Column
                    </Button>
                    <Button size="small" icon={<PlusOutlined />}>
                      Row
                    </Button>
                  </Space>
                </div>

                <Table columns={columns} dataSource={data} size="small" pagination={false} bordered />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Showing 1-1 of 1 items
                  </Text>
                  <Pagination simple defaultCurrent={1} total={1} size="small" />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <Button icon={<UploadOutlined />} size="small">
                    Import CSV
                  </Button>
                  <Button icon={<DownloadOutlined />} size="small">
                    Export
                  </Button>
                </div>
              </div>
            </Space>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined /> Settings
              </span>
            }
            key="settings"
            style={{ height: "100%", overflow: "auto", padding: "16px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Title level={5}>Certificate Settings</Title>
                <Divider style={{ margin: "8px 0" }} />
                <Form layout="horizontal" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                  <Form.Item label="Page Size">
                    <Select defaultValue="a4">
                      <Option value="a4">A4</Option>
                      <Option value="letter">Letter</Option>
                      <Option value="legal">Legal</Option>
                      <Option value="custom">Custom</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Orientation">
                    <Select defaultValue="landscape">
                      <Option value="portrait">Portrait</Option>
                      <Option value="landscape">Landscape</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </div>

              <div style={{ marginTop: 16 }}>
                <Title level={5}>Export Options</Title>
                <Divider style={{ margin: "8px 0" }} />
                <Form layout="horizontal" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                  <Form.Item label="File Format">
                    <Select defaultValue="pdf">
                      <Option value="pdf">PDF</Option>
                      <Option value="png">PNG</Option>
                      <Option value="jpg">JPG</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Quality: 100%">
                    <Slider min={50} max={100} step={5} defaultValue={100} />
                  </Form.Item>
                </Form>
              </div>

              <div style={{ marginTop: 16 }}>
                <Title level={5}>Template Management</Title>
                <Divider style={{ margin: "8px 0" }} />
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button icon={<PlusOutlined />} block>
                    Save as Template
                  </Button>
                  <Button icon={<CopyOutlined />} block>
                    Duplicate Certificate
                  </Button>
                </Space>
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Content>

      <Footer
        style={{
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button icon={<EyeOutlined />}>Preview</Button>
        <Button type="primary">Generate Certificates</Button>
      </Footer>
    </Layout>
  )
}

interface SignatoryCardProps {
  signatory: SignatoryType
  onInvite: (id: string) => void
  onRemove: (id: string) => void
  onResend: (id: string) => void
}

export function SignatoryCard({ signatory, onInvite, onRemove, onResend }: SignatoryCardProps) {
  const getStatusTag = () => {
    switch (signatory.status) {
      case "not_invited":
        return <Tag>Not Invited</Tag>
      case "invited":
        return <Tag color="blue">Invited</Tag>
      case "signed":
        return <Tag color="green">Signed</Tag>
      default:
        return null
    }
  }

  const getInitials = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase()
  }

  const getActionButton = () => {
    switch (signatory.status) {
      case "not_invited":
        return (
          <Button type="primary" size="small" onClick={() => onInvite(signatory.id)}>
            Invite
          </Button>
        )
      case "invited":
        return (
          <Button size="small" onClick={() => onResend(signatory.id)}>
            Resend
          </Button>
        )
      case "signed":
        return null
      default:
        return null
    }
  }

  return (
    <Card
      size="small"
      bodyStyle={{
        padding: "12px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
          style={{
            backgroundColor: "#1677ff",
            color: "#fff",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getInitials(signatory.email)}
        </Avatar>

        <div style={{ flex: 1 }}>
          <Text style={{ display: "block" }}>{signatory.email}</Text>
          {getStatusTag()}
        </div>

        <Space size={8}>
          {getActionButton()}
          <Popconfirm
            title="Remove signatory"
            description="Are you sure you want to remove this signatory?"
            onConfirm={() => onRemove(signatory.id)}
            okText="Remove"
            cancelText="Cancel"
            placement="left"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ width: 24, height: 24 }} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  )
}


interface TextFieldCardProps {
  field: TextFieldType
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleVisibility: (id: string) => void
}

export function TextFieldCard({ field, onEdit, onDelete, onToggleVisibility }: TextFieldCardProps) {
  return (
    <Card
      size="small"
      bodyStyle={{
        padding: "12px 16px",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <DragOutlined
          style={{
            color: "#bfbfbf",
            cursor: "move",
            fontSize: 14,
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text strong>{field.label}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {field.type}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {field.placeholder || field.defaultValue || `{${field.name}}`}
          </Text>
        </div>

        <Space size={4}>
          <Tooltip title={field.visible ? "Hide" : "Show"}>
            <Button
              type="text"
              size="small"
              icon={field.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => onToggleVisibility(field.id)}
              style={{ width: 24, height: 24 }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(field.id)}
              style={{ width: 24, height: 24 }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(field.id)}
              style={{ width: 24, height: 24 }}
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  )
}

export interface TextFieldType {
  id: string
  name: string
  label: string
  type: "text" | "date" | "number"
  placeholder?: string
  defaultValue?: string
  visible: boolean
  required?: boolean
}

export interface SignatoryType {
  id: string
  email: string
  status: "not_invited" | "invited" | "signed"
  invitedAt?: string
  signedAt?: string
}

