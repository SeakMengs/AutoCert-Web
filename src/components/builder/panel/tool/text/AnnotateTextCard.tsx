import { TextAnnotateState } from "@/components/builder/hooks/useAutoCert";
import { logger } from "@/utils/logger";
import {
  Button,
  Card,
  ColorPicker,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import {
  AutoCertTextToolProps,
  fontOptions,
  TextAnnotateFormSchema,
} from "./AutoCertTextTool";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

interface AutoCertTextToolListProps
  extends Pick<
    AutoCertTextToolProps,
    | "selectedAnnotateId"
    | "columns"
    | "onAnnotateSelect"
    | "onTextAnnotateUpdate"
    | "onTextAnnotateRemove"
  > {
  textAnnotate: TextAnnotateState;
  pageNumber: number;
}

const { Text } = Typography;
const { Option } = Select;

export default function AnnotateTextCard({
  pageNumber,
  textAnnotate,
  selectedAnnotateId,
  columns,
  onAnnotateSelect,
  onTextAnnotateUpdate,
  onTextAnnotateRemove,
}: AutoCertTextToolListProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<TextAnnotateFormSchema>();

  const resetForm = () => {
    form.setFieldsValue({
      value: textAnnotate.value,
      fontName: textAnnotate.font.name,
      color: textAnnotate.color,
    });
  };

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
    resetForm();
  };

  const onModalCancel = () => {
    setEditModalOpen(false);
    resetForm();
  };

  const handleEditField = async () => {
    logger.debug("AutoCert edit text field confirmed");
    try {
      const values = await form.validateFields();
      onTextAnnotateUpdate(textAnnotate.id, values);
      setEditModalOpen(false);
    } catch (error) {
      logger.error("AutoCert edit text field failed", error);
    }
  };

  return (
    <>
      <Card
        onClick={() => onAnnotateSelect(textAnnotate.id)}
        size="small"
        className="w-full"
        style={{
          border: "1px solid transparent",
          borderColor:
            textAnnotate.id === selectedAnnotateId ? colorPrimary : undefined,
        }}
      >
        <Flex justify="space-between" align="center">
          <Space>
            <Tooltip title="Table column">
              <Tag>{textAnnotate.value}</Tag>
            </Tooltip>
            <Text type="secondary">Page: {pageNumber}</Text>
          </Space>
          <Space>
            <Tooltip title="Edit">
              <Button
                size="small"
                type="text"
                onClick={toggleEditModal}
                icon={<EditOutlined />}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure to remove this field?"
              onConfirm={() => onTextAnnotateRemove(textAnnotate.id)}
            >
              <Tooltip title="Remove">
                <Button
                  size="small"
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        </Flex>
      </Card>
      <Modal
        title="Edit Field"
        open={editModalOpen}
        onCancel={onModalCancel}
        onOk={handleEditField}
      >
        <Form form={form} layout="horizontal">
          <Form.Item
            name="value"
            label="Field"
            initialValue={textAnnotate.value}
            rules={[
              {
                required: true,
                message: "Please select a table column field",
              },
            ]}
          >
            <Select>
              {columns.map((column) => (
                <Option key={column.title} value={column.title}>
                  {column.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fontName"
            label="Font Name"
            initialValue={textAnnotate.font.name}
          >
            <Select>
              {fontOptions.map((font) => (
                <Option key={font.value} value={font.value}>
                  {font.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="color"
            label="Color"
            initialValue={textAnnotate.color}
            getValueFromEvent={(color: AggregationColor) => {
              return `#${color.toHex()}`;
            }}
          >
            <ColorPicker size="small" showText />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
