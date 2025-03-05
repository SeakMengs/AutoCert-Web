import { AnnotateColor } from "@/components/builder/hooks/useAutoCert";
import { logger } from "@/utils/logger";
import { Select, Form, Button, Modal, ColorPicker } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import {
  AutoCertTextToolProps,
  fontOptions,
  TextAnnotateFormSchema,
} from "./AutoCertTextTool";
import { PlusOutlined } from "@ant-design/icons";

interface AutoCertTextToolAddProps
  extends Pick<
    AutoCertTextToolProps,
    "onTextAnnotateAdd" | "columns" | "currentPdfPage"
  > {}

const { Option } = Select;
export default function AutoCertTextToolAdd({
  currentPdfPage,
  columns,
  onTextAnnotateAdd,
}: AutoCertTextToolAddProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<TextAnnotateFormSchema>();

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
    logger.debug("AutoCert add text field confirmed");

    try {
      const values = await form.validateFields();
      onTextAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add text field failed", error);
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
        Text Field
      </Button>
      <Modal
        title="Add New Field"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={handleAddField}
      >
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
