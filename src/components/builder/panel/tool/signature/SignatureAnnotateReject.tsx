"use client";
import { Button, Tooltip, Modal, Input, Form } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";
import { useState } from "react";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateReject",
);

export interface SignatureAnnotateRejectProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateReject" | "signatureAnnotate"
  > {
  canReject: boolean;
}

export default function SignatureAnnotateReject({
  signatureAnnotate,
  canReject,
  onSignatureAnnotateReject,
}: SignatureAnnotateRejectProps) {
  const [rejecting, setRejecting] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleRejectSignatory = async (reason?: string): Promise<void> => {
    logger.debug(
      "AutoCert reject signature confirmed",
      signatureAnnotate.email,
      signatureAnnotate.id,
    );

    if (!canReject) {
      logger.warn("AutoCert reject signature is not allowed");
      return;
    }

    setRejecting(true);
    try {
      // fake loading to simulate the reject process
      await wait(FAKE_LOADING_TIME);
      onSignatureAnnotateReject(signatureAnnotate.id, reason);
    } catch (error) {
      logger.error("AutoCert reject signature failed", error);
    } finally {
      setRejecting(false);
    }
  };

  const showRejectModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const reason = values.reason?.trim();

      setIsModalVisible(false);
      form.resetFields();

      await handleRejectSignatory(reason);
    } catch (error) {
      logger.error("Form validation failed", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Tooltip title="Reject signature">
        <Button
          variant="solid"
          size="small"
          color="red"
          onClick={showRejectModal}
          loading={rejecting}
          disabled={!canReject || rejecting}
        >
          Reject
        </Button>
      </Tooltip>

      <Modal
        title="Reject Signature"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: rejecting,
        }}
        cancelButtonProps={{
          disabled: rejecting,
        }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="reason"
            label="Reason for rejection"
            rules={[
              {
                max: 150,
                message: "Reason must be at most 150 characters long.",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Please explain why you are rejecting this signature... (Optional)"
              maxLength={150}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
