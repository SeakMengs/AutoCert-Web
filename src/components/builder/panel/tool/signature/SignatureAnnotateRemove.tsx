import { Button, Popconfirm, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { DeleteOutlined } from "@ant-design/icons";
import { createScopedLogger } from "@/utils/logger";
import { SignatoryStatus } from "@/types/project";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateRemove",
);

export interface SignatureAnnotateRemoveProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateRemove" | "signatureAnnotate"
  > {}

export default function SignatureAnnotateRemove({
  signatureAnnotate,
  onSignatureAnnotateRemove,
}: SignatureAnnotateRemoveProps) {
  const handleRemoveAnnotate = async (): Promise<void> => {
    logger.debug("AutoCert remove signature annotate confirmed");
    try {
      onSignatureAnnotateRemove(signatureAnnotate.id);
    } catch (error) {
      logger.error("AutoCert remove signature annotate failed", error);
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
        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
      </Tooltip>
    </Popconfirm>
  );
}
