"use client";
import { Button, ColorPicker, Form, Modal, Select, Tooltip } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { ColumnAnnotateFormSchema, fontOptions } from "./ColumnTool";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createScopedLogger } from "@/utils/logger";
import { ColumnAnnotateCardProps } from "./ColumnAnnotateCard";

const logger = createScopedLogger(
  "components:builder:panel:tool:column:ColumnAnnotateEdit",
);

export interface ColumnAnnotateEditProps
  extends Pick<
    ColumnAnnotateCardProps,
    "columns" | "onColumnAnnotateUpdate" | "columnAnnotate"
  > {}

const { Option } = Select;

export default function ColumnAnnotateEdit({
  columnAnnotate,
  columns,
  onColumnAnnotateUpdate,
}: ColumnAnnotateEditProps) {
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<ColumnAnnotateFormSchema>();

  const resetForm = (): void => {
    form.setFieldsValue({
      value: columnAnnotate.value,
      fontName: columnAnnotate.fontName,
      color: columnAnnotate.color,
    });
  };

  const toggleEditModal = (): void => {
    setEditModalOpen(!editModalOpen);
    resetForm();
  };

  const onModalCancel = (): void => {
    setEditModalOpen(false);
    resetForm();
  };

  const handleEditField = async (): Promise<void> => {
    logger.debug("AutoCert edit annotate column field confirmed");
    try {
      const values = await form.validateFields();
      onColumnAnnotateUpdate(columnAnnotate.id, values);
      setEditModalOpen(false);
    } catch (error) {
      logger.error("AutoCert edit annotate column field failed", error);
    }
  };

  return (
    <>
      <Tooltip title="Edit">
        <Button
          size="small"
          type="text"
          onClick={toggleEditModal}
          icon={<EditOutlined />}
        />
      </Tooltip>
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
            initialValue={columnAnnotate.fontName}
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
