import { Form, Button, Modal, ColorPicker, Input } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  SignatureAnnotateFormSchema,
  SignatureToolProps,
} from "./SignatureTool";
import { AnnotateColor } from "@/components/builder/hooks/useAutoCert";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateAdd",
);

interface SignatureAnnotateAddProps
  extends Pick<
    SignatureToolProps,
    "onSignatureAnnotateAdd" | "currentPdfPage"
  > {}

export default function SignatureAnnotateAdd({
  currentPdfPage,
  onSignatureAnnotateAdd,
}: SignatureAnnotateAddProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<SignatureAnnotateFormSchema>();

  const resetForm = (): void => {
    form.setFieldsValue({
      email: "",
      color: AnnotateColor,
    });
  };

  const toggleModal = (): void => {
    setModalOpen(!modalOpen);
    resetForm();
  };

  const onModalCancel = (): void => {
    setModalOpen(false);
    resetForm();
  };

  const handleAddAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert add signature annotate confirmed");

    try {
      const values = await form.validateFields();
      onSignatureAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add signature annotate failed", error);
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
        onOk={handleAddAnnotate}
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
