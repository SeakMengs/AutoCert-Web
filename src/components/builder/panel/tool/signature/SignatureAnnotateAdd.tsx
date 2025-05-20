"use client";
import { Form, Button, Modal, ColorPicker, Input } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  SignatureAnnotateFormSchema,
  SignatureToolProps,
} from "./SignatureTool";
import { createScopedLogger } from "@/utils/logger";
import { wait } from "@/utils";
import { AnnotateColor } from "@/components/builder/store/autocertAnnotate";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";

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
  const [adding, setAdding] = useState<boolean>(false);

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
    setAdding(true);
    try {
      const values = await form.validateFields();

      await wait(FAKE_LOADING_TIME);

      onSignatureAnnotateAdd(currentPdfPage, values);
      setModalOpen(false);
    } catch (error) {
      logger.error("AutoCert add signature annotate failed", error);
    } finally {
      setAdding(false);
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
        confirmLoading={adding}
      >
        <Form form={form} layout="horizontal" disabled={adding}>
          <Form.Item
            required
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
            required
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
