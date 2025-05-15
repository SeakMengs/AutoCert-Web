import FormErrorMessages from "@/components/error/FormErrorMessages";
import { cn } from "@/utils";
import { trimSvgWhitespace } from "@/utils/svg";
import { App, ColorPickerProps, Space, Flex, ColorPicker, Button } from "antd";
import { AggregationColor } from "antd/es/color-picker/color";
import { useRef, useState, useMemo } from "react";
import { SharedSignatureModalProps } from "./signature_section";
import { createScopedLogger } from "@/utils/logger";
import SignatureCanvas from "react-signature-canvas";
import { ClearOutlined, SaveOutlined } from "@ant-design/icons";

const logger = createScopedLogger(
  "app:dashboard:signature-request:signature_drawer",
);

interface SignatureDrawerProps extends SharedSignatureModalProps {}

export default function SignatureDrawer({
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
      return svg;
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
