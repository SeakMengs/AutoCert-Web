"use client";

import type React from "react";
import { useState, useRef, useMemo } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Button,
  Modal,
  Tabs,
  Upload,
  Space,
  App,
  Typography,
  theme,
  TabsProps,
  Alert,
  ColorPicker,
  Flex,
  ColorPickerProps,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SignatureOutlined,
  ClearOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { trimSvgWhitespace } from "@/utils/svg";
import Marquee from "react-fast-marquee";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { AggregationColor } from "antd/es/color-picker/color";
import { createScopedLogger } from "@/utils/logger";

const { Title } = Typography;
const logger = createScopedLogger(
  "app:dashboard:signature-request:signature-section",
);

interface SignatureSectionProps {
  onSignatureChange: (base64Signature: string | null) => void;
}

export default function SignatureSection({
  onSignatureChange,
}: SignatureSectionProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const { message } = App.useApp();
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSignatureChange = (base64Signature: string | null): void => {
    logger.debug("Signature change");
    setSignature(base64Signature);
    onSignatureChange(base64Signature);
  };

  const onSignatureSave = (base64Signature: string | null): void => {
    handleSignatureChange(base64Signature);
    setIsModalVisible(false);
  };

  const removeSignature = (): void => {
    handleSignatureChange(null);
    message.success("Signature removed successfully");
  };

  const tabs = [
    {
      key: "1",
      label: (
        <span>
          <UploadOutlined /> Upload
        </span>
      ),
      children: <SignatureUpload onSignatureSave={onSignatureSave} />,
    },
    {
      key: "2",
      label: (
        <span>
          <SignatureOutlined /> Draw
        </span>
      ),
      children: <SignatureDrawer onSignatureSave={onSignatureSave} />,
    },
  ] satisfies TabsProps["items"];

  return (
    <div>
      <Space direction="vertical">
      <Title level={4} className="m-0">Your Signature</Title>
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
      >
        <Tabs items={tabs} defaultActiveKey={tabs[0].key} />
      </Modal>
    </div>
  );
}

interface SignatureUploadProps {
  onSignatureSave: (base64Signature: string | null) => void;
}

function SignatureUpload({ onSignatureSave }: SignatureUploadProps) {
  const { message } = App.useApp();

  const handleSignatureUpload = (info: UploadChangeParam<UploadFile>): void => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;
      if (!file) {
        message.error("Failed to upload signature");
        return;
      }

      const base64 = URL.createObjectURL(file);
      onSignatureSave(base64);
      message.success("Signature uploaded successfully");
    }
  };

  return (
    <Upload.Dragger
      name="file"
      accept=".png, .svg"
      onChange={handleSignatureUpload}
      showUploadList={false}
    >
      <p className="ant-upload-drag-icon">
        <UploadOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
    </Upload.Dragger>
  );
}

interface SignatureDrawerProps {
  onSignatureSave: (base64SvgSignature: string | null) => void;
}

function SignatureDrawer({ onSignatureSave }: SignatureDrawerProps) {
  const defaultSignatureHex = "#000000";
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [signatureHex, setSignatureHex] = useState<string>(defaultSignatureHex);
  const { message } = App.useApp();

  const signatureColorPresets = useMemo(() => {
    return [
      {
        label: "Suggested colors for e-signature",
        key: "common",
        colors: [
          defaultSignatureHex,
          "#1873e3",
          "#a7c9ee",
          "#145cbc",
          "#647ca4",
          "#b6c0cc",
        ],
      },
    ] satisfies ColorPickerProps["presets"];
  }, []);

  const getBase64SvgSignature = (): string | null => {
    try {
      if (!signatureRef.current) {
        return null;
      }

      const svg = signatureRef.current.toDataURL("image/svg+xml");
      const trimmedSvg = trimSvgWhitespace(svg);
      clearSignature();
      message.success("Signature saved successfully");

      return trimmedSvg;
    } catch (error) {
      message.error("Error while trying to get signature from canvas");
      logger.error(
        `Error while trying to get signature from canvas. Error: ${error}`,
      );
    }

    return null;
  };

  const clearSignature = (): void => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const onColorChange = (color: AggregationColor, css: string): void => {
    setSignatureHex(`#${color.toHex()}`);
  };

  return (
    <Space direction="vertical" className="w-full h-full">
      <div className="w-full h-64 relative">
        <SignatureCanvas
          ref={signatureRef}
          penColor={signatureHex}
          velocityFilterWeight={0.9}
          canvasProps={{
            className: "w-full h-full signatureCanvas",
            style: { border: "1px solid #d9d9d9", borderRadius: "2px" },
          }}
        />
      </div>
      <Flex gap={8} align="center" wrap>
        <ColorPicker
          defaultValue={signatureHex}
          showText
          onChange={onColorChange}
          presets={signatureColorPresets}
        />
        <Button onClick={clearSignature} icon={<ClearOutlined />}>
          Clear
        </Button>
        <Button
          type="primary"
          onClick={() => onSignatureSave(getBase64SvgSignature())}
          icon={<SaveOutlined />}
        >
          Save Signature
        </Button>
      </Flex>
    </Space>
  );
}
