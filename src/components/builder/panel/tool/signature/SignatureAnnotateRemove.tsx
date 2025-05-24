"use client";
import { Button, Popconfirm, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { DeleteOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { SignatoryStatus } from "@/types/project";
import { useState } from "react";
import { wait } from "@/utils";
import { FAKE_LOADING_TIME } from "@/components/builder/store/autocertChangeSlice";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateRemove",
);

export interface SignatureAnnotateRemoveProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateRemove" | "signatureAnnotate"
  > {
    canRemove: boolean;
  }

export default function SignatureAnnotateRemove({
  signatureAnnotate,
  canRemove,
  onSignatureAnnotateRemove,
}: SignatureAnnotateRemoveProps) {
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleRemoveAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert remove signature annotate confirmed");
    
    if (!canRemove) {
      logger.warn("AutoCert remove signature annotate is not allowed");
      return;
    }

    setDeleting(true);

    try {
      await wait(FAKE_LOADING_TIME);

      onSignatureAnnotateRemove(signatureAnnotate.id);
    } catch (error) {
      logger.error("AutoCert remove signature annotate failed", error);
    } finally {
      setDeleting(false);
    }
  };

  const getRemoveConfirmMessage = (): string => {
    const prefix = "Are you sure you want to remove this signatory?";
    switch (signatureAnnotate.status) {
      case SignatoryStatus.NotInvited:
        return prefix;
      case SignatoryStatus.Invited:
        return `${prefix} They will no longer be able to sign this certificate.`;
      case SignatoryStatus.Signed:
        return `${prefix} The signature will be removed from the certificate.`;
      default:
        return prefix;
    }
  };

  return (
    <Popconfirm
      title={getRemoveConfirmMessage()}
      onConfirm={handleRemoveAnnotate}
    >
      <Tooltip title="Delete">
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          loading={deleting}
          disabled={!canRemove || deleting}
        />
      </Tooltip>
    </Popconfirm>
  );
}
