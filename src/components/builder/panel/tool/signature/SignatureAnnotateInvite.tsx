import { Button, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger(
  "components:builder:panel:tool:signature:SignatureAnnotateInvite",
);

export interface SignatureAnnotateInviteProps
  extends Pick<
    SignatureAnnotateCardProps,
    "onSignatureAnnotateInvite" | "signatureAnnotate"
  > {}

export default function SignatureAnnotateInvite({
  signatureAnnotate,
  onSignatureAnnotateInvite,
}: SignatureAnnotateInviteProps) {
  const handleInviteSignatory = async (): Promise<void> => {
    logger.debug(
      "AutoCert invite signatory confirmed",
      signatureAnnotate.email,
      signatureAnnotate.id,
    );

    try {
      onSignatureAnnotateInvite(signatureAnnotate.id);
    } catch (error) {
      logger.error("AutoCert invite signatory failed", error);
    }
  };

  return (
    <Tooltip title="Invite signatory">
      <Button type="primary" size="small" onClick={handleInviteSignatory}>
        Invite
      </Button>
    </Tooltip>
  );
}
