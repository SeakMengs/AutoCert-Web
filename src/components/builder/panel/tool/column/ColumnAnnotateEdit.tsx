"use client";
import {
  Button,
  ColorPicker,
  Flex,
  Form,
  Modal,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { ColumnAnnotateFormSchema, FontOptions } from "./ColumnTool";
import { EditOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createScopedLogger } from "@/utils/logger";
import { ColumnAnnotateCardProps } from "./ColumnAnnotateCard";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";

const logger = createScopedLogger(
  "components:builder:panel:tool:column:ColumnAnnotateEdit",
);

export interface ColumnAnnotateEditProps
  extends Pick<
    ColumnAnnotateCardProps,
    "columns" | "onColumnAnnotateUpdate" | "columnAnnotate"
  > {
  canEdit: boolean;
}

const { Option } = Select;
const { Text } = Typography;

export default function ColumnAnnotateEdit({
  columnAnnotate,
  columns,
  canEdit,
  onColumnAnnotateUpdate,
}: ColumnAnnotateEditProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<ColumnAnnotateFormSchema>();

  const resetForm = (): void => {
    form.setFieldsValue({
      value: columnAnnotate.value,
      fontName: columnAnnotate.fontName,
      color: columnAnnotate.color,
      fontColor: columnAnnotate.fontColor,
      textFitRectBox: columnAnnotate.textFitRectBox,
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

    if (!canEdit) {
      logger.warn("AutoCert edit annotate column field not allowed");
      return;
    }

    setEditing(true);

    try {
      const values = await form.validateFields();

      await wait(FAKE_LOADING_TIME);

      onColumnAnnotateUpdate(columnAnnotate.id, values);
      setEditModalOpen(false);
    } catch (error) {
      logger.error("AutoCert edit annotate column field failed", error);
    } finally {
      setEditing(false);
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
          disabled={!canEdit}
        />
      </Tooltip>
      <Modal
        title="Edit Field"
        open={editModalOpen}
        onCancel={onModalCancel}
        onOk={handleEditField}
        confirmLoading={editing}
      >
        <Form form={form} layout="horizontal" disabled={editing}>
          <Form.Item
            required
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
            required
            name="fontName"
            label="Font Name"
            initialValue={columnAnnotate.fontName}
          >
            <Select>
              {FontOptions.map((font) => (
                <Option key={font.value} value={font.value}>
                  {font.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            required
            name="fontColor"
            label="Font Color"
            initialValue={columnAnnotate.fontColor}
            getValueFromEvent={(color: AggregationColor) => {
              return `#${color.toHex()}`;
            }}
          >
            <ColorPicker size="small" showText />
          </Form.Item>
          <Form.Item
            required
            name="color"
            label="Color"
            initialValue={columnAnnotate.color}
            getValueFromEvent={(color: AggregationColor) => {
              return `#${color.toHex()}`;
            }}
          >
            <ColorPicker size="small" showText />
          </Form.Item>
          {/* <Form.Item
            required
            name={"textFitRectBox"}
            initialValue={columnAnnotate.textFitRectBox}
            label={
              <Text>
                Text fit rectangle box
                <Tooltip title="Automatically adjusts font size to fit text within the rectangle box.">
                  <QuestionCircleOutlined className="ml-1" />
                </Tooltip>
              </Text>
            }
          >
            <Switch />
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
}
