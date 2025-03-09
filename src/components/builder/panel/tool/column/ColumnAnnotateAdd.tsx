import { AnnotateColor } from "@/components/builder/hooks/useAutoCert";
import { logger } from "@/utils/logger";
import { Select, Form, Button, Modal, ColorPicker, Alert } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import { fontOptions, ColumnAnnotateFormSchema, ColumnToolProps } from "./ColumnTool";
import { PlusOutlined } from "@ant-design/icons";

interface ColumnAnnotateAddProps
  extends Pick<
    ColumnToolProps,
    "onColumnAnnotateAdd" | "columns" | "currentPdfPage"
  > {}

const { Option } = Select;

export default function ColumnAnnotateAdd({
  currentPdfPage,
  columns,
  onColumnAnnotateAdd,
}: ColumnAnnotateAddProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<ColumnAnnotateFormSchema>();

  const resetForm = () => {
    form.setFieldsValue({
      value: columns[0]?.title,
      fontName: "Arial",
      color: AnnotateColor,
    });
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    resetForm();
  };

  const onModalCancel = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleAddField = async () => {
    logger.debug("AutoCert add column field confirmed");

    try {
      const values = await form.validateFields();
      onColumnAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add column field failed", error);
    }
  };

  return (
    <>
      <Button
        className="w-full"
        type="dashed"
        icon={<PlusOutlined />}
        onClick={toggleModal}
      >
        Column Field
      </Button>
      <Modal
        title="Add Column Field"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={handleAddField}
      >
        {Array.isArray(columns) && columns.length === 0 && (
          <Alert
            className="mb-4"
            message="To add a column field, please insert the table data column on the second tab first."
            type="warning"
            showIcon
            closable
          />
        )}
        <Form form={form} layout="horizontal">
          <Form.Item
            name="value"
            label="Field"
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
          <Form.Item name="fontName" label="Font Name" initialValue="Arial">
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
            initialValue={AnnotateColor}
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
