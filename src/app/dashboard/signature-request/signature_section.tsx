"use client";

import type React from "react";
import { useState, useRef, useMemo, useEffect } from "react";
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
import { UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload";
import { AggregationColor } from "antd/es/color-picker/color";
import { createScopedLogger } from "@/utils/logger";
import useAsync from "@/hooks/useAsync";
import { addSignatureAction } from "./action";
import { ALLOWED_SIG_FILE_TYPES } from "./schema";
import { base64ToFile } from "@/utils/file";
import FetchLoading from "@/components/loading/FetchLoading";
import { cn } from "@/utils";
import FormErrorMessages from "@/components/error/FormErrorMessages";

const { Title } = Typography;
const logger = createScopedLogger(
  "app:dashboard:signature-request:signature-section",
);

interface SignatureSectionProps {}

export default function SignatureSection({}: SignatureSectionProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const { message } = App.useApp();
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const addSignature = useAsync(addSignatureAction);

  const handleSignatureChange = (base64Signature: string | null): void => {
    logger.debug("Signature change");
    setSignature(base64Signature);
  };

  useEffect(() => {
    if (addSignature.data?.signature.url) {
      setSignature(addSignature.data.signature.url);
    }
  }, [addSignature.data?.signature.url]);

  const onSignatureSave = async (sig: string | File): Promise<boolean> => {
    logger.debug("addSignatureState signature");

    let file: File = sig as File;

    if (typeof sig === "string") {
      const base64Signature = sig;
      file = base64ToFile(base64Signature, "signature.svg");
    }

    const sucess = await addSignature.fetch({
      signatureFile: file,
    });

    if (!sucess) {
      message.error("Failed to save signature");
      return false;
    }

    handleSignatureChange(URL.createObjectURL(file));
    setIsModalVisible(false);

    message.success("Signature saved successfully");
    return true;
  };

  const removeSignature = (): void => {
    handleSignatureChange(null);
    message.success("Signature removed successfully");
  };

  const onTabChange = (activeKey: string): void => {
    logger.debug("Tab changed", activeKey);

    addSignature.reset();
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
          addSignatureState={addSignature}
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
          addSignatureState={addSignature}
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

interface SharedSignatureModalProps {
  onSignatureSave: (base64Signature: string | File) => Promise<boolean>;
  addSignatureState: Pick<
    ReturnType<typeof useAsync<ReturnType<typeof addSignatureAction>>>,
    "loading" | "error"
  >;
}

interface SignatureUploadProps extends SharedSignatureModalProps {}

function SignatureUpload({
  onSignatureSave,
  addSignatureState,
}: SignatureUploadProps) {
  const { message } = App.useApp();

  const handleSignatureUpload = async (
    info: UploadChangeParam<UploadFile>,
  ): Promise<void> => {
    switch (info.file.status) {
      case "done":
        // since this will never call cuz the beforeUpload is set to false
        break;
      case "removed":
        message.success(`${info.file.name} file (client) removed successfully`);
        break;
      case "error":
        message.error(`${info.file.name} file (client) upload failed.`);
        break;
    }
  };

  // antd will call handleBeforeFileUpload when the file is selected
  const handleBeforeFileUpload: UploadProps["beforeUpload"] = async (file) => {
    if (!file) {
      message.error("Failed to upload signature");
      return;
    }

    await onSignatureSave(file);

    // if return true, antd will upload to the server which is not what we want
    return false;
  };

  return (
    <Space direction="vertical" className="w-full h-full">
      <Upload.Dragger
        name="file"
        accept={ALLOWED_SIG_FILE_TYPES.map(
          (type) => `.${type.split("/")[1].replace("+xml", "")}`,
        ).join(",")}
        onChange={handleSignatureUpload}
        beforeUpload={handleBeforeFileUpload}
        showUploadList={false}
        multiple={false}
        maxCount={1}
        disabled={addSignatureState.loading}
      >
        <FetchLoading spinning={addSignatureState.loading}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
        </FetchLoading>
      </Upload.Dragger>
      {addSignatureState.error && (
        <FormErrorMessages errors={addSignatureState.error} />
      )}
    </Space>
  );
}

interface SignatureDrawerProps extends SharedSignatureModalProps {}

function SignatureDrawer({
  onSignatureSave,
  addSignatureState,
}: SignatureDrawerProps) {
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

      return trimmedSvg;
    } catch (error) {
      message.error("Error while trying to get signature from canvas");
      logger.error(
        `Error while trying to get signature from canvas. Error: ${error}`,
      );
    }

    return null;
  };

  const onSignatureSaveClick = async (): Promise<void> => {
    const base64Signature = getBase64SvgSignature();
    if (!base64Signature) {
      message.error("Failed to get signature from canvas");
      return;
    }

    const ok = await onSignatureSave(base64Signature);
    if (ok) {
      clearSignature();
    }
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
            className: cn("w-full h-full signatureCanvas", {
              "pointer-events-none select-none": addSignatureState.loading,
            }),
            style: { border: "1px solid #d9d9d9", borderRadius: "2px" },
          }}
        />
      </div>
      {addSignatureState.error && (
        <FormErrorMessages errors={addSignatureState.error} />
      )}
      <Flex gap={8} align="center" wrap>
        <ColorPicker
          defaultValue={signatureHex}
          showText
          onChange={onColorChange}
          presets={signatureColorPresets}
          disabled={addSignatureState.loading}
        />
        <Button
          onClick={clearSignature}
          icon={<ClearOutlined />}
          disabled={addSignatureState.loading}
        >
          Clear
        </Button>
        <Button
          type="primary"
          onClick={onSignatureSaveClick}
          icon={<SaveOutlined />}
          loading={addSignatureState.loading}
          disabled={addSignatureState.loading}
        >
          Save Signature
        </Button>
      </Flex>
    </Space>
  );
}
