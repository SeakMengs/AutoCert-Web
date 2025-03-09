import { ColumnAnnotateState } from "@/components/builder/hooks/useAutoCert";
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
  ColumnToolProps,
  fontOptions,
  ColumnAnnotateFormSchema,
} from "./ColumnTool";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

interface ColumnAnnotateCardProps
  extends Pick<
    ColumnToolProps,
    | "selectedAnnotateId"
    | "columns"
    | "onAnnotateSelect"
    | "onColumnAnnotateUpdate"
    | "onColumnAnnotateRemove"
  > {
  columnAnnotate: ColumnAnnotateState;
  pageNumber: number;
}

const { Text } = Typography;
const { Option } = Select;

export default function ColumnAnnotateCard({
  pageNumber,
  columnAnnotate,
  selectedAnnotateId,
  columns,
  onAnnotateSelect,
  onColumnAnnotateUpdate,
  onColumnAnnotateRemove,
}: ColumnAnnotateCardProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<ColumnAnnotateFormSchema>();

  const resetForm = () => {
    form.setFieldsValue({
      value: columnAnnotate.value,
      fontName: columnAnnotate.font.name,
      color: columnAnnotate.color,
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
    logger.debug("AutoCert edit column field confirmed");
    try {
      const values = await form.validateFields();
      onColumnAnnotateUpdate(columnAnnotate.id, values);
      setEditModalOpen(false);
    } catch (error) {
      logger.error("AutoCert edit column field failed", error);
    }
  };

  return (
    <>
      <Card
        onClick={() => onAnnotateSelect(columnAnnotate.id)}
        size="small"
        className="w-full"
        style={{
          border: "1px solid transparent",
          borderColor:
            columnAnnotate.id === selectedAnnotateId ? colorPrimary : undefined,
        }}
      >
        <Flex justify="space-between" align="center" wrap>
          <Space>
            <Tooltip title="Table column">
              <Tag>{columnAnnotate.value}</Tag>
            </Tooltip>
            <Text type="secondary" className="text-xs">
              Page: {pageNumber}
            </Text>
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
              onConfirm={() => onColumnAnnotateRemove(columnAnnotate.id)}
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
            initialValue={columnAnnotate.value}
            rules={[
              {
                required: true,
                message: "Please select a table column field",
              },
            ]}
          >
            <Select>
              {columns.map((c) => (
                <Option key={c.title} value={c.title}>
                  {c.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fontName"
            label="Font Name"
            initialValue={columnAnnotate.font.name}
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
            initialValue={columnAnnotate.color}
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
