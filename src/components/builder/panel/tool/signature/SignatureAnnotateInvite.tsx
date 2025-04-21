"use client";
import { Button, Tooltip } from "antd";
import { SignatureAnnotateCardProps } from "./SignatureAnnotateCard";
import { createScopedLogger } from "@/utils/logger";
import { boolean } from "zod";
import { useState } from "react";
import { FAKE_LOADING_TIME } from "@/components/builder/hooks/useAutoCertChange";
import { wait } from "@/utils";

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
  const [iniviting, setInviting] = useState<boolean>(false);

  const handleInviteSignatory = async (): Promise<void> => {
    logger.debug(
      "AutoCert invite signatory confirmed",
      signatureAnnotate.email,
      signatureAnnotate.id,
    );
    setInviting(true);

    try {
      // fake loading to simulate the invite process
      await wait(FAKE_LOADING_TIME);

      onSignatureAnnotateInvite(signatureAnnotate.id);
    } catch (error) {
      logger.error("AutoCert invite signatory failed", error);
    } finally {
      setInviting(false);
    }
  };

  return (
    <Tooltip title="Invite signatory">
      <Button
        type="primary"
        size="small"
        onClick={handleInviteSignatory}
        loading={iniviting}
        disabled={iniviting}
      >
        Invite
      </Button>
    </Tooltip>
  );
}
