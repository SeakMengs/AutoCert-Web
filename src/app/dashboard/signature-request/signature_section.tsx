"use client";

import type React from "react";
import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Button,
  Modal,
  Tabs,
  Upload,
  message,
  Space,
  Typography,
  theme,
  TabsProps,
  Flex,
  Alert,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SignatureOutlined,
} from "@ant-design/icons";
import { trimSvgWhitespace } from "@/utils/svg";
import Marquee from "react-fast-marquee";
import { UploadChangeParam, UploadFile } from "antd/es/upload";

const { Title } = Typography;

interface SignatureSectionProps {
  onSignatureChange: (signatureBase64: string | null) => void;
}

export default function SignatureSection({
  onSignatureChange,
}: SignatureSectionProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  const handleSignatureChange = (signatureBase64: string | null) => {
    setSignature(signatureBase64);
    onSignatureChange(signatureBase64);
  };

  const handleUpload = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === "done") {
      const file = info.file.originFileObj;
      if (!file) {
        message.error("Failed to upload signature");
        return;
      }

      const base64 = URL.createObjectURL(file);
      handleSignatureChange(base64);
      message.success("Signature uploaded successfully");
      setIsModalVisible(false);
    }
  };

  const handleSignatureSave = () => {
    if (signatureRef.current) {
      const svg = signatureRef.current.toDataURL("image/svg+xml");
      const trimmedSvg = trimSvgWhitespace(svg);
      handleSignatureChange(trimmedSvg);
      clearSignature();
      message.success("Signature saved successfully");
      setIsModalVisible(false);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const removeSignature = () => {
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
      children: (
        <Upload.Dragger
          name="file"
          accept=".png, .svg"
          onChange={handleUpload}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
        </Upload.Dragger>
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
        <>
          <div className="h-[200px] border border-gray-300">
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              velocityFilterWeight={0.9}
              canvasProps={{
                className: "w-full h-full signatureCanvas",
                style: { border: "1px solid #d9d9d9", borderRadius: "4px" },
              }}
            />
          </div>
          <Space style={{ marginTop: "10px" }}>
            <Button onClick={clearSignature}>Clear</Button>
            <Button type="primary" onClick={handleSignatureSave}>
              Save Signature
            </Button>
          </Space>
        </>
      ),
    },
  ] satisfies TabsProps["items"];

  return (
    <div>
      <Title level={5}>Your Signature</Title>
      <Space direction="vertical">
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
            <Space>
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
