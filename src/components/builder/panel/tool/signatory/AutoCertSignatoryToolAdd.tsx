import { logger } from "@/utils/logger";
import { Form, Button, Modal, ColorPicker, Input } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  AutoCertSignatoryToolProps,
  SignatureAnnotateFormSchema,
} from "./AutoCertSignatoryTool";
import { AnnotateColor } from "@/components/builder/hooks/useAutoCert";

interface AutoCertSignatureToolAddProps
  extends Pick<
    AutoCertSignatoryToolProps,
    "onSignatureAnnotateAdd" | "currentPdfPage"
  > {}

export default function AutoCertSignatureToolAdd({
  currentPdfPage,
  onSignatureAnnotateAdd,
}: AutoCertSignatureToolAddProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<SignatureAnnotateFormSchema>();

  const resetForm = () => {
    form.setFieldsValue({
      email: "",
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
    logger.debug("AutoCert add signature field confirmed");

    try {
      const values = await form.validateFields();
      onSignatureAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add signature field failed", error);
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
        Signature Placement
      </Button>
      <Modal
        title="Add Signature Placement"
        open={modalOpen}
        onCancel={onModalCancel}
        onOk={handleAddField}
      >
        <Form form={form} layout="horizontal">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              {
                type: "email",
                message: "Email is not valid",
              },
            ]}
          >
            <Input />
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
