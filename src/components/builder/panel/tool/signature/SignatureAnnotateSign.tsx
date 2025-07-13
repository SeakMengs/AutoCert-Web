"use client";
import { App, Button, Popconfirm, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";
import { useState } from "react";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateSign",
);

export interface SignatureAnnotateSignProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateSign" | "signatureAnnotate"
  > {
  canSign: boolean;
}

export default function SignatureAnnotateSign({
  signatureAnnotate,
  canSign,
  onSignatureAnnotateSign,
}: SignatureAnnotateSignProps) {
  const { message } = App.useApp();
  const [signing, setSigning] = useState<boolean>(false);

  const handleSignAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert sign signature annotate confirmed");

    if (!canSign) {
      logger.warn("AutoCert sign signature annotate is not allowed");
      return;
    }

    setSigning(true);

    try {
      await onSignatureAnnotateSign(signatureAnnotate.id);
    } catch (error) {
      logger.error("AutoCert sign signature annotate failed", error);
      message.error("Failed to sign signature");
    } finally {
      setSigning(false);
    }
  };

  return (
    <Popconfirm
      title="Are you sure you want to sign signature to this project?"
      onConfirm={handleSignAnnotate}
    >
      <Tooltip title="Sign signature">
        <Button
          variant="solid"
          size="small"
          color="green"
          loading={signing}
          disabled={!canSign || signing}
        >
          Approve
        </Button>
      </Tooltip>
    </Popconfirm>
  );
}
