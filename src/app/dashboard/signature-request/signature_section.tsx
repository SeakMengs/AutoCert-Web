"use client";

import type React from "react";
import { useState } from "react";
import {
  Button,
  Modal,
  Tabs,
  Space,
  App,
  Typography,
  theme,
  TabsProps,
  Alert,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SignatureOutlined,
} from "@ant-design/icons";
import Marquee from "react-fast-marquee";
import { createScopedLogger } from "@/utils/logger";
import { addSignatureAction } from "./action";
import { base64ToFile } from "@/utils/file";
import { SIGNATURE_COOKIE_NAME } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { setCookie } from "@/utils/server/cookie";
import moment from "moment";
import SignatureUpload from "./signature_upload";
import SignatureDrawer from "./signature_drawer";

const { Title } = Typography;
const logger = createScopedLogger(
  "app:dashboard:signature-request:signature_section",
);

export interface SharedSignatureModalProps {
  onSignatureSave: (base64Signature: string | File) => Promise<boolean>;
  addSignatureState: {
    loading: boolean;
    error: Record<string, string> | null;
  };
}

interface SignatureSectionProps {}

export default function SignatureSection({}: SignatureSectionProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const { message } = App.useApp();
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data,
    mutateAsync,
    isPending,
    reset: resetMutation,
  } = useMutation({
    mutationFn: addSignatureAction,
    onSuccess: async (data, variables) => {
      if (!data.success) {
        message.error("Failed to save signature");
        return;
      }

      handleSignatureChange(data.data.signature.url);
      onModalClose();
      message.success("Signature saved successfully");

      await setCookie(
        SIGNATURE_COOKIE_NAME,
        data.data.signature.id,
        moment().add(5, "year").toDate(),
      );
      // TODO: invalidate cache query
    },
    onError: (error) => {
      logger.error("Failed to save signature", error);
      message.error("Failed to save signature.");
    },
  });

  const handleSignatureChange = (base64Signature: string | null): void => {
    logger.debug("Signature change");
    setSignature(base64Signature);
  };

  const onSignatureSave = async (sig: string | File): Promise<boolean> => {
    logger.debug("addSignatureState signature");

    let file: File = sig as File;

    if (typeof sig === "string") {
      const base64Signature = sig;
      file = base64ToFile(base64Signature, "signature.svg");
    }

    await mutateAsync({
      signatureFile: file,
    });

    return true;
  };

  const removeSignature = (): void => {
    handleSignatureChange(null);
    message.success("Signature removed successfully");
  };

  const onModalClose = (): void => {
    setIsModalVisible(false);
    reset();
  };

  const reset = (): void => {
    resetMutation();
  };

  const onTabChange = (activeKey: string): void => {
    logger.debug("Tab changed", activeKey);

    resetMutation();
  };

  const addSignatureState = {
    loading: isPending,
    error: data && !data.success ? data.errors : null,
  };

  const tabs = [
    {
      key: "1",
      label: (
        <span>
          <UploadOutlined /> Upload
        </span>
      ),
      children: (
        <SignatureUpload
          onSignatureSave={onSignatureSave}
          addSignatureState={addSignatureState}
        />
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <SignatureOutlined /> Draw
        </span>
      ),
      children: (
        <SignatureDrawer
          onSignatureSave={onSignatureSave}
          addSignatureState={addSignatureState}
        />
      ),
    },
  ] satisfies TabsProps["items"];

  return (
    <div>
      <Space direction="vertical">
        <Title level={4} className="m-0">
          Your Signature
        </Title>
        <Alert
          banner
          message={
            <Marquee pauseOnHover gradient={false}>
              Upload or draw your signature to encrypt and store it securely on
              the server. Only you can access it, and it will be used to sign
              certificates upon your approval.
            </Marquee>
          }
        />
        {signature ? (
          <Space direction="vertical">
            <img
              src={signature}
              alt="Your signature"
              className="max-w-80"
              style={{
                border: `1px solid ${colorSplit}`,
              }}
            />
            <Space wrap>
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Change Signature
              </Button>
              <Button danger onClick={removeSignature}>
                Remove Signature
              </Button>
            </Space>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add Signature
          </Button>
        )}
      </Space>
      <Modal
        title={signature ? "Change Your Signature" : "Add Your Signature"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Tabs
          items={tabs}
          defaultActiveKey={tabs[0].key}
          onChange={onTabChange}
        />
      </Modal>
    </div>
  );
}
